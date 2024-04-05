package actor.room

import io.circe.*
import io.circe.syntax.*
import message.OutgoingMessage
import message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import actor.lobby.Lobby.*
import actor.UserManager.UserMessage
import actor.room.Room.RoomMessage
import actor.room.Room.*

case class Room(roomId: String, roomName: String, session: ActorRef[UserMessage], lobby: ActorRef[LobbyMessage]) {
  def live(data: Data): Behavior[RoomMessage] = Behaviors.receive({ case (context, message) =>
    message match {
       case JoinRoom(userId) =>
         context.log.debug(s"UserId $userId joined room ${data.name}")
         val updatedData = data.userJoin(userId)
         session ! JoinSuccess(updatedData.players, roomId)
         lobby ! UserLeftLobby(userId)
         lobby ! RoomUpdate(roomId, data.allUserIds.size, isStarted = false)
         live(data.userJoin(userId))

       case ReadyToggle(userId) =>
         val (updatedData, isReady) = data.userReadyToggle(userId)
         if (updatedData.canStart) {
           context.log.debug("Start game")
           session ! GameStart(updatedData.allUserIds)
           lobby ! RoomUpdate(roomId, data.allUserIds.size, isStarted = true)
           gameStarted(updatedData)
         } else {
           context.log.debug(s"User $userId is ready")
           session ! UserReadyToggle(userId, isReady, updatedData.allUserIds)
           live(updatedData)
         }
    }
  })


  def gameStarted(data: Data): Behavior[RoomMessage] = Behaviors.receiveMessagePartial({
    case _ => Behaviors.same
  })
}

object Room {
  private val MAX_PLAYERS = 3

  private[room] case class Data(name: String, players: List[Player], spectators: List[Spectator]) {

    def canStart: Boolean = this.players.forall(_.isReady)

    def userJoin(userId: UserId): Data = {
      if (players.size == MAX_PLAYERS) {
        this.copy(spectators = this.spectators :+ Spectator(userId))
      } else {
        this.copy(players = this.players :+ Player.create(userId))
      }
    }
    
    def allUserIds: List[UserId] = this.players.map(_.userId) ++ this.spectators.map(_.userId)

    def userReadyToggle(userId: UserId): (Data, Boolean) = {
      this.players.find(_.userId == userId) match {
        case None => throw new RuntimeException(s"userId not found $userId")
        case Some(player) =>
          val updatedPlayers = players.filterNot(_.userId == userId) :+ player.readyToggle
          (this.copy(players = updatedPlayers), !player.isReady)
      }
    }
  }

  private[room] case class Player private(userId: UserId, isReady: Boolean, score: Int) {
    def readyToggle: Player = this.copy(isReady = !isReady)
    
    def asJson: Json = Json.obj(
      "userId" -> userId.asJson,
      "isReady" -> isReady.asJson
    )
  }

  object Player {
    def create(userId: UserId): Player = Player(userId,  isReady = false, score = 0)
  }

  private[room] case class Spectator(userId: UserId)

  sealed trait RoomMessage

  case class ReadyToggle(userId: UserId) extends RoomMessage

  case class JoinRoom(userId: UserId) extends RoomMessage

  case class JoinSuccess(players: List[Player], roomId: String) extends OutgoingMessage {
    override def recipients: List[UserId] = players.map(_.userId)

    override def toWsMessage: Message = {
      val json = Json.obj(
        "tpe" -> OutgoingMessage.USER_JOINED_ROOM.asJson,
        "data" -> Json.obj(
          "roomId" -> roomId.asJson,
          "players" -> Json.arr(players.map(_.asJson): _*)
        )
      )
      TextMessage.Strict(json.noSpaces)
    }
  }

  case class UserReadyToggle(userId: UserId, isReady: Boolean, recipients: List[UserId]) extends OutgoingMessage{
    override def toWsMessage: Message = {
      TextMessage.Strict(Json.obj(
        "tpe" -> OutgoingMessage.USER_READY.asJson,
        "data" -> Json.obj(
           "userId" -> userId.asJson,
           "isReady" -> isReady.asJson
         )
        ).noSpaces)
    }
  }

  case class GameStart(recipients: List[UserId]) extends OutgoingMessage {
    override val toWsMessage: Message = {
      TextMessage.Strict(Json.obj(
        "tpe" -> OutgoingMessage.GAME_START.asJson,
        ).noSpaces)
    }
  }

  def create(roomId: String, name: String, owner: Player, session: ActorRef[UserMessage], lobby: ActorRef[LobbyMessage]): Behavior[RoomMessage] = {
    Room(roomId, name, session, lobby).live(Data(name, List(owner), Nil))
  }
}
