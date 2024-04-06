package actor.message

import io.circe.{Decoder, JsonObject}
import io.circe.generic.semiauto.*
import io.circe.jawn.decode
import actor.message.OutgoingMessage.UserId
import org.apache.pekko.http.scaladsl.model.ws
import org.apache.pekko.http.scaladsl.model.ws.{TextMessage, Message as WSMessage}
import org.apache.pekko.actor.typed.ActorRef
import io.circe._, io.circe.parser._, io.circe.syntax._, io.circe.Decoder._
import actor.room.Room
import actor.room.Room.Answer

sealed trait IncomingMessage

case class UserRequest(val userId: UserId, val tpe: Int, val roomId: Option[String], val data: Option[JsonObject]) extends IncomingMessage

object UserRequest {
  private val JOIN_ROOM = 3
  private val CREATE_ROOM = 4
  private val READY = 5
  private val PLAYER_REPLY = 8

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

  case class RoomRequest(userId: UserId, roomId: String, tpe: Int, data: Option[JsonObject])

  private def parseRoomRequest(req: UserRequest): Option[RoomRequest] = {
     req.roomId.map(roomId => RoomRequest(req.userId, roomId, req.tpe, req.data))
  }

  object Ready {
    def unapply(req: UserRequest): Option[(UserId, String)] = {
         parseRoomRequest(req).flatMap{ roomReq =>
            if (req.tpe == READY) {
              Some(req.userId -> roomReq.roomId)
            } else None
         }
    }
  }

  object PlayerReply{
    def unapply(req: UserRequest): Option[(UserId, String, Answer)] = {
       parseRoomRequest(req).flatMap{ roomReq =>
         if (roomReq.tpe == PLAYER_REPLY) {
           roomReq.data.flatMap{data =>
             data("answer").flatMap(_.asNumber.flatMap(_.toInt)).flatMap{answerId =>
                Room.Answer.parse(answerId)
             }.map(answer => (roomReq.userId, roomReq.roomId, answer))
           }
         } else None
       }
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
