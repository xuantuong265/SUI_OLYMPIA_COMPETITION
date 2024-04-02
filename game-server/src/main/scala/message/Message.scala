package message

import io.circe.{Decoder, JsonObject}
import io.circe.generic.semiauto.*
import io.circe.jawn.decode
import message.OutgoingMessage.UserId
import org.apache.pekko.http.scaladsl.model.ws

trait IncomingMessage


case class SessionMessage(sessionId: String, tpe: Int, roomId: Option[String], data: JsonObject) extends IncomingMessage


object IncomingMessage {
  given sessionMessageDecoder: Decoder[SessionMessage] = deriveDecoder[SessionMessage]

  def parse(text: String): Option[IncomingMessage] = decode[SessionMessage](text).toOption

}

object OutgoingMessage  {
  type UserId = String
}

trait OutgoingMessage {
   def recipients: List[UserId]
   def toWsMessage: ws.Message
}
