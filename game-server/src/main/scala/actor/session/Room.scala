package actor.session

import actor.session.Lobby.{LobbyMessage, RoomUpdate}
import actor.session.Room.*
import actor.session.UserManager.UserMessage
import io.circe.*
import io.circe.syntax.*
import message.OutgoingMessage
import message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}

case class Room(roomId: String, roomName: String, session: ActorRef[UserMessage], lobby: ActorRef[LobbyMessage]) {
  def live(data: Data): Behavior[RoomMessage] = Behaviors.receiveMessage({
    case Join(userId) =>
      println(s"UserId $userId joined room ${data.name}")
      val updatedData = data.userJoin(userId)
      session ! JoinSuccess(updatedData.players, roomId)
      lobby ! RoomUpdate(roomId, data.allUserIds.size, isStarted = false)
      live(data.userJoin(userId))
    case Ready(userId) =>
      live(data.userReady(userId))
  })
}

object Room {
  private val MAX_PLAYERS = 3

  case class Data(name: String, players: List[Player], spectators: List[Spectator]) {
    def userJoin(userId: UserId): Data = {
      if (players.size == MAX_PLAYERS) {
        this.copy(spectators = this.spectators :+ Spectator(userId))
      } else {
        this.copy(players = this.players :+ Player.create(userId))
      }
    }
    
    def allUserIds: List[UserId] = this.players.map(_.userId) ++ this.spectators.map(_.userId)

    def userReady(userId: UserId): Data = {
      this.players.find(_.userId == userId) match {
        case None => this
        case Some(player) =>
          val updatedPlayers = players.filterNot(_.userId == userId) :+ player.ready
          this.copy(players = updatedPlayers)
      }
    }
  }

  case class Player private(userId: UserId, isReady: Boolean, score: Int) {
    def ready: Player = this.copy(isReady = true)
    
    def asJson: Json = Json.obj(
      "userId" -> userId.asJson,
      "isReady" -> isReady.asJson
    )
  }

  object Player {
    def create(userId: UserId): Player = Player(userId,  isReady = false, score = 0)
  }

  case class Spectator(userId: UserId)

  sealed trait RoomMessage

  case class Ready(userId: UserId) extends RoomMessage

  case class Join(userId: UserId) extends RoomMessage

  case class JoinSuccess(players: List[Player], roomId: String) extends OutgoingMessage {
    override def recipients: List[UserId] = players.map(_.userId)

    override def toWsMessage: Message = {
      val json = Json.obj(
        "tpe" -> 3.asJson,
        "data" -> Json.obj(
          "roomId" -> roomId.asJson,
          "players" -> Json.arr(players.map(_.asJson): _*)
        )
      )
      TextMessage.Strict(json.noSpaces)
    }
  }

  def create(roomId: String, name: String, owner: Player, session: ActorRef[UserMessage], lobby: ActorRef[LobbyMessage]): Behavior[RoomMessage] = {
    Room(roomId, name, session, lobby).live(Data(name, List(owner), Nil))
  }
}