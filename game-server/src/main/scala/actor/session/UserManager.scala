package actor.session

import actor.session.Lobby.{Join, LobbyMessage, UserManagerGreeting}
import actor.session.UserManager.{CreateSession, UserMessage, UserSession}
import io.circe.Json
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import io.circe.Encoder.*
import message.{IncomingMessage, OutgoingMessage}

import java.time.Instant
import message.OutgoingMessage.UserId
import scala.annotation.experimental
import message.SessionMessage
import actor.session.Room.RoomMessage

object UserManager {
  case class UserSession(userId: String, sessionId: String, actorRef: ActorRef[Message])

  type UserMessage = IncomingMessage | OutgoingMessage

  case class CreateSession(userId: String, actorRef: ActorRef[Message]) extends IncomingMessage

  case class CreateRoom(name: String, owerId: UserId) extends IncomingMessage

  object CreateSession {
    private val PREFIX = "LOGIN-"
    private val userIdRegex = s"$PREFIX(\\w+)".r

    def parseUserId(text: String): Option[String] = {
      userIdRegex.findFirstMatchIn(text).map(matched =>
        matched.group(1)
      )
    }
  }

  def create(lobby: ActorRef[LobbyMessage]): Behavior[UserMessage] = {
    Behaviors.setup(context =>
      lobby ! UserManagerGreeting(context.self)
      UserManager(lobby).live(Map.empty)
    )
  }

}

case class UserManager(lobby: ActorRef[LobbyMessage]) {

def live(onlineUsers: Map[String, UserSession], rooms: Map[String, ActorRef[RoomMessage]]): Behavior[UserMessage] = Behaviors.setup{ context =>
  Behaviors.receiveMessagePartial{
  case CreateSession(userId, ref) =>
    // todo : check and override existing session
    val sessionId = s"$userId#${Instant.now.getEpochSecond}"
    val newSession = UserSession(userId, sessionId, ref)
    println(s"new session created $sessionId")
    val json = Json.obj(
      "sessionId" -> Json.fromString(sessionId),
      "onlineCount" -> Json.fromInt(onlineUsers.size)
    )
    lobby ! Join(userId)
    ref ! TextMessage.apply(json.toString)
    live(onlineUsers + (userId -> newSession), Map.empty)

  case SessionMessage(sessionId, tpe, None, data) if tpe == 4 =>
    val roomName = decode[String](data)
    val room = context.spawn(Room)


  case SessionMessage(sessionId, tpe, Some(roomId), data) =>
    // TODO verify sessionId
    rooms.get(roomId) foreach { actorRef =>

    }
    Behaviors.same


  case out: OutgoingMessage =>
    out.recipients.foreach { recipient =>
      println(s"Sending out message to $recipient")
      onlineUsers.get(recipient) match
        case None =>
          println(s"Error: $recipient not found")
        case Some(userSession) =>
          userSession.actorRef ! out.toWsMessage
    }
    Behaviors.same

 }
}


}



