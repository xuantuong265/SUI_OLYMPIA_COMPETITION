package actor.session

import actor.session.Lobby.{Join, LobbyMessage, RoomCreated, UserManagerGreeting}
import actor.session.Room.{Player, RoomMessage}
import actor.session.UserManager.*
import io.circe.*
import io.circe.generic.auto.*
import io.circe.syntax.*
import message.OutgoingMessage.UserId
import message.{IncomingMessage, OutgoingMessage, SessionMessage}
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.actor.typed.{ActorRef, Behavior, Terminated}
import org.apache.pekko.http.scaladsl.model.ws.{TextMessage, Message as WSMessage}
import message.UserRequest
import java.time.Instant
import message.CreateSession

object UserManager {
  case class UserSession(userId: String, sessionId: String, actorRef: ActorRef[WSMessage])


  type UserMessage = IncomingMessage | OutgoingMessage | UserDisconnected
  
  case class UserDisconnected(userId: UserId)

  case class LoginSuccess(session: UserSession) extends OutgoingMessage {
    override def recipients: List[UserId] = List(session.userId)

    override def toWsMessage: WSMessage = {
      val json = Json.obj(
        "tpe" -> 0.asJson,
        "data" -> Json.obj(
          "sessionId" -> session.sessionId.asJson
        )
      )
      TextMessage.Strict(json.noSpaces)
    }
  }



  case class Data(onlineUsers: Map[UserId, UserSession],
                  sessions: Map[String, UserId],
                  rooms: Map[String, ActorRef[RoomMessage]]) {
    def createSession(userId: UserId, ref: ActorRef[WSMessage]): (Data, UserSession) = {
      val sessionId = s"$userId#${Instant.now.getEpochSecond}"
      val newSession = UserSession(userId, sessionId, ref)
      val updatedData = onlineUsers.get(userId) match {
        case Some(existingSession) =>
          this.copy(sessions = (sessions - existingSession.sessionId) + (newSession.sessionId -> userId))
        case None =>
          this.copy(sessions = sessions + (newSession.sessionId -> userId))
      }

      updatedData.copy(onlineUsers = onlineUsers + (userId -> newSession)) -> newSession
    }

    def addRoom(roomId: String, ref: ActorRef[RoomMessage]): Data = {
      this.copy(rooms = rooms + (roomId -> ref))
    }
    
    def removeSession(userId: UserId): Data = {
      this.onlineUsers.get(userId) match {
        case None =>
          this
        case Some(session) =>
          this.copy(onlineUsers = onlineUsers - userId, sessions = sessions - session.sessionId)
      }
    }

  }

  def create(lobby: ActorRef[LobbyMessage]): Behavior[UserMessage] = {
    Behaviors.setup(context =>
      lobby ! UserManagerGreeting(context.self)
      UserManager(lobby).live(Data(Map.empty, Map.empty, Map.empty))
    )
  }

}

case class UserManager(lobby: ActorRef[LobbyMessage]) {

  def live(data: Data): Behavior[UserMessage] = Behaviors.receive[UserMessage] { (context, message) =>
    message match {
      case CreateSession(userId, ref) =>
        val (updatedData, session) = data.createSession(userId, ref)
        lobby ! Join(userId)
        context.self ! LoginSuccess(session)
        println(s"new session created ${session.sessionId}")
        context.watchWith(ref, UserDisconnected(userId))
        live(updatedData)

      case UserDisconnected(userId) =>
        context.log.debug(s"User $userId was disconnected")
        // TODO propagate to Lobby/Rooms
        live(data.removeSession(userId))

      case SessionMessage(sessionId, roomId, tpe, jsonData) =>
        data.sessions.get(sessionId) match {
          case None =>
            context.log.warn(s"Received not authenticated message with session Id : $sessionId")
          case Some(userId) =>
            context.self ! UserRequest(userId, tpe, roomId, jsonData)
        }
        Behaviors.same


      case UserRequest.CreateRoom(userId, roomName) =>
          val roomId = s"${101 + data.rooms.size}"
          val owner = Player.create(userId)
          val room = context.spawn(Room.create(roomId, roomName, owner, context.self, lobby), s"room-$roomId")
          val updatedData = data.addRoom(roomId, room)
          lobby ! RoomCreated(roomId, roomName)
          live(updatedData)

      case UserRequest.JoinRoom(userId, roomId) =>
        data.rooms.get(roomId) foreach { roomRef =>
          roomRef ! Room.Join(userId)
        }
        Behaviors.same

      case UserRequest.Ready(userId, roomId) =>
        data.rooms.get(roomId) foreach { roomRef =>
          roomRef ! Room.Ready(userId)
        }
        Behaviors.same


      case out: OutgoingMessage =>
        out.recipients.foreach { recipient =>
          println(s"Sending out message to $recipient:\n${out.toWsMessage}")
          data.onlineUsers.get(recipient) match
            case None =>
              println(s"Error: $recipient not found")
            case Some(userSession) =>
              userSession.actorRef ! out.toWsMessage
        }
        Behaviors.same

      case m@ _ =>
        context.log.warn(s"unhandled message $m")
        Behaviors.same
    }
  }

}



