package message

import io.circe.{Decoder, JsonObject}
import io.circe.generic.semiauto.*
import io.circe.jawn.decode
import message.OutgoingMessage.UserId
import org.apache.pekko.http.scaladsl.model.ws
import org.apache.pekko.http.scaladsl.model.ws.{TextMessage, Message as WSMessage}
import org.apache.pekko.actor.typed.ActorRef
import io.circe._, io.circe.parser._, io.circe.syntax._, io.circe.Decoder._

sealed trait IncomingMessage

case class UserRequest(val userId: UserId, val tpe: Int, val roomId: Option[String], val data: Option[JsonObject]) extends IncomingMessage

object UserRequest {
  private val JOIN_ROOM = 3
  private val CREATE_ROOM = 4
  private val READY = 5

  object JoinRoom {
    def unapply(req: UserRequest): Option[(UserId, String)] = {
      if (req.tpe == JOIN_ROOM) {
        req.data.flatMap(json =>
            json("roomId").flatMap(_.asString).map(roomId =>
              (req.userId, roomId)
            )
        )
      } else None
    }
  }

  object CreateRoom {
    def unapply(req: UserRequest): Option[(UserId, String)] = {
      if (req.tpe == CREATE_ROOM) {
        req.data.flatMap(json =>
            json("roomName").flatMap(_.asString).map(roomName =>
              (req.userId, roomName)
            )
        )
      } else None
    }
  }

  object Ready {
    def unapply(req: UserRequest): Option[(UserId, String)] = {
      if (req.tpe == READY) {
        req.data.flatMap(json =>
            json("roomId").map(roomName =>
              (req.userId, roomName.toString)
            )
        )
      } else None
    }
  }
}

case class CreateSession(userId: String, actorRef: ActorRef[WSMessage]) extends IncomingMessage
case class SessionMessage(sessionId: String, roomId: Option[String], tpe: Int, data: Option[JsonObject]) extends IncomingMessage


object SessionMessage {
  given d: Decoder[SessionMessage] = deriveDecoder[SessionMessage]

  def parse(text: String): Option[SessionMessage] = decode[SessionMessage](text).toOption

}

object CreateSession {
    private val PREFIX = "LOGIN-"
    private val userIdRegex = s"$PREFIX(\\w+)".r

    def parseUserId(text: String): Option[String] = {
      userIdRegex.findFirstMatchIn(text).map(matched =>
        matched.group(1)
      )
    }
}

object OutgoingMessage  {
  type UserId = String
  val USER_JOINED_ROOM = 3
  val USER_READY = 5
  val GAME_START = 6
  val NEW_ROUND = 7
}

trait OutgoingMessage {
   def recipients: List[UserId]
   def toWsMessage: ws.Message
}
