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
import actor.session.Lobby.UserLeftLobby

case class Room(roomId: String, roomName: String, session: ActorRef[UserMessage], lobby: ActorRef[LobbyMessage]) {
  def live(data: Data): Behavior[RoomMessage] = Behaviors.receiveMessage({
    case Join(userId) =>
      println(s"UserId $userId joined room ${data.name}")
      val updatedData = data.userJoin(userId)
      session ! JoinSuccess(updatedData.players, roomId)
      lobby ! UserLeftLobby(userId)
      lobby ! RoomUpdate(roomId, data.allUserIds.size, isStarted = false)
      live(data.userJoin(userId))

    case Ready(userId) =>
      val updatedData = data.userReady(userId)
      if (updatedData.canStart) {
        println("Start game")
        session ! GameStart(updatedData.allUserIds)
        lobby ! RoomUpdate(roomId, data.allUserIds.size, isStarted = true)
        gameStarted(updatedData)
      } else {
        println(s"User $userId is ready")
        session ! UserReady(userId, updatedData.allUserIds)
        live(updatedData)
      }
  })


  def gameStarted(data: Data): Behavior[RoomMessage] = Behaviors.receiveMessagePartial({
    case _ => Behaviors.same
  })
}

object Room {
  private val MAX_PLAYERS = 3

  case class Data(name: String, players: List[Player], spectators: List[Spectator]) {

    def canStart: Boolean = this.players.forall(_.isReady)

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
        "tpe" -> OutgoingMessage.USER_JOINED_ROOM.asJson,
        "data" -> Json.obj(
          "roomId" -> roomId.asJson,
          "players" -> Json.arr(players.map(_.asJson): _*)
        )
      )
      TextMessage.Strict(json.noSpaces)
    }
  }

  case class UserReady(userId: UserId, recipients: List[UserId]) extends OutgoingMessage{
    override def toWsMessage: Message = {
      TextMessage.Strict(Json.obj(
        "tpe" -> OutgoingMessage.USER_READY.asJson,
        "data" -> Json.obj(
           "userId" -> userId.asJson
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
