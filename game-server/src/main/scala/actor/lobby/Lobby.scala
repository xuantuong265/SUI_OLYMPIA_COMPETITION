package actor.lobby

import io.circe.*
import io.circe.generic.semiauto.*
import io.circe.syntax.*
import actor.message.OutgoingMessage
import actor.message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import actor.lobby.Lobby.*
import actor.UserManager.UserMessage


case class Lobby(session: ActorRef[UserMessage]) {
  private def live(data: Data): Behavior[LobbyMessage] = Behaviors.receiveMessagePartial {
    case Join(userId) =>
      println(s"User $userId joined Lobby")
      val updatedData = data.join(userId)
      session ! updatedData.syncMessage
      live(updatedData)

    case RoomCreated(id, name) =>
      val updatedData = data.addRoom(Room(id, name, userCount = 1, isStarted = false))
      session ! updatedData.syncMessage
      live(updatedData)

    case UserLeftLobby(id) =>
      println(s"user $id left Lobby")
      val updatedData = data.leave(id)
      session ! updatedData.syncMessage
      live(updatedData)


    case RoomUpdate(id, userCount, isStarted) =>
      val updatedData = data.updateRoom(id, userCount, isStarted)
      session ! updatedData.syncMessage
      live(updatedData)

  }
}


object Lobby {

  private def postStart(): Behavior[LobbyMessage] = Behaviors.receiveMessagePartial {
    case UserManagerGreeting(actorRef) =>
      println(s"Greeting from UserManager")
      Lobby(actorRef).live(Data(Nil, Nil))
  }

  sealed trait LobbyMessage

  case class Join(userId: String) extends LobbyMessage

  case class RoomCreated(id: String, name: String) extends LobbyMessage

  case class RoomUpdate(id: String, userCount: Int, isStarted: Boolean) extends LobbyMessage

  case class UserLeftLobby(id: UserId) extends LobbyMessage

  case class UserManagerGreeting(actorRef: ActorRef[UserMessage]) extends LobbyMessage

  private[lobby] case class SyncLobbyData(recipients: List[UserId], rooms: List[Room]) extends OutgoingMessage {
    override def toWsMessage: Message = {
      val json = Json.obj(
        "tpe" -> 1.asJson,
        "data" -> Json.obj(
          "userCount" -> recipients.size.asJson,
          "rooms" -> rooms.asJson
        )
      )
      TextMessage.Strict(json.noSpaces)
    }
  }

  private[lobby] case class User(userId: String)


  given roomEncoder: Encoder[Room] = deriveEncoder

  private[lobby] case class Room(id: String, name: String, userCount: Int, isStarted: Boolean) {
    def update(userCount: Int, isStarted: Boolean): Room =
      this.copy(userCount = userCount, isStarted = isStarted)
  }

  private case class Data(users: List[User], rooms: List[Room]) {
    def join(userId: UserId): Data = {
      this.copy(users = this.users :+ User(userId))
    }

    def leave(userId: UserId): Data  = {
      this.copy(users = this.users.filterNot(_.userId == userId))
    }

    def addRoom(room: Room): Data = this.copy(rooms = rooms :+ room)

    def updateRoom(id: String, userCount: Int, isStarted: Boolean): Data = {
      this.rooms.partition(_.id == id) match {
        case (room :: Nil, otherRooms) =>
          this.copy(rooms = otherRooms :+ room.update(userCount, isStarted))
        case _ => this
      }
    }

    def syncMessage: SyncLobbyData = SyncLobbyData(this.users.map(_.userId), this.rooms)
  }

  def apply(): Behavior[LobbyMessage] = {
    postStart()
  }


}
