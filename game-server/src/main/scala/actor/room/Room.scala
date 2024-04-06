package actor.room

import io.circe.*
import io.circe.syntax.*
import actor.message.OutgoingMessage
import actor.message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import actor.lobby.Lobby.*
import actor.UserManager.UserMessage
import actor.room.Room.RoomMessage
import actor.room.Room.*
import actor.room.Room.Answer.CorrectAnswer

case class Room(roomId: String, roomName: String, session: ActorRef[UserMessage], lobby: ActorRef[LobbyMessage]) {
  def live(data: Data): Behavior[RoomMessage] = Behaviors.receivePartial((context, message) => {
    message match {
       case JoinRoom(userId) =>
         context.log.debug(s"UserId $userId joined room $roomId")
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
           context.self ! NextRound
           gameStarted(updatedData.toPlayData)
         } else {
           context.log.debug(s"User $userId is ready")
           session ! UserReadyToggle(userId, isReady, updatedData.allUserIds)
           live(updatedData)
         }
    }
  })


  def gameStarted(data: PlayData): Behavior[RoomMessage] = Behaviors.receivePartial((context, message) => message match {
    case NextRound =>
      session ! data.currentRoundData
      Behaviors.same

    case PlayerReply(userId, answer) =>
      context.log.debug(s"Player $userId send answer $answer")
      gameStarted(data.addReply(Reply(userId, answer)))
  })
}

object Room {
  private val MAX_PLAYERS = 3

  private[room] case class Data(players: List[Player], spectators: List[Spectator]) {

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

    def toPlayData: PlayData = {
      val questions = List(
         Question("Màu chủ đạo của tờ tiền polymer mệnh giá 500.000 đồng là màu nào?",
            Answer.A("Đỏ"),
            Answer.B("Xanh"),
            Answer.C("Tím"),
            Answer.D("Vàng"),
            CorrectAnswer.B
           ),

         Question("Có câu thành ngữ: \"Đi mây về ...\" gì?",
            Answer.A("Mây"),
            Answer.B("Núi"),
            Answer.C("Gió"),
            Answer.D("Biển"),
            CorrectAnswer.A
           )
        )
      PlayData(players, spectators, 1, questions, Nil)
    }
  }

  private[room] case class Player private(userId: UserId, isReady: Boolean, score: Int) { // FIXME: isReady only makes sense in pre-game state
    def readyToggle: Player = this.copy(isReady = !isReady)

    def addScore(s: Int): Player = this.copy(score = this.score + s)
    
    def asJson: Json = Json.obj(
      "userId" -> userId.asJson,
      "isReady" -> isReady.asJson
    )
  }

  object Player {
    def create(userId: UserId): Player = Player(userId,  isReady = false, score = 0)
  }

  private[room] case class Spectator(userId: UserId)


  private[actor] sealed trait Answer {
    def text: String
    def id: Int
    override def hashCode(): Int = this.id
    override def equals(x: Any): Boolean = x match {
      case other: Answer => this.id == other.id
      case _ => false
    }
  }

  object Answer {

    def parse(id: Int): Option[Answer] = id match {
       case CorrectAnswer.A.id => Some(CorrectAnswer.A)
       case CorrectAnswer.B.id => Some(CorrectAnswer.B)
       case CorrectAnswer.C.id => Some(CorrectAnswer.C)
       case CorrectAnswer.D.id => Some(CorrectAnswer.D)
       case _ => None
    }

    case class A(text: String) extends Answer {
       override val id: Int = 1
    }

    case class B(text: String) extends Answer {
       override val id: Int = 2
    }


    case class C(text: String) extends Answer {
       override val id: Int = 3
    }


    case class D(text: String) extends Answer {
       override val id: Int = 4
    }

    object CorrectAnswer {
       object A extends Answer.A("A")
       object B extends Answer.B("B")
       object C extends Answer.C("C")
       object D extends Answer.D("D")
    }
  }

  private[room] case class Question(q: String,
                                    a: Answer.A, b: Answer.B, c: Answer.C, d: Answer.D,
                                    correctAnswer: Answer) {
     def asJson: Json = Json.obj(
       "q" -> q.asJson,
       "a" -> a.text.asJson,
       "b" -> b.text.asJson,
       "c" -> c.text.asJson,
       "d" -> d.text.asJson
     )
   }

  private[room] case class Reply(userId: UserId, answer: Answer)

  private[room] case class PlayData(players: List[Player],
                                    spectators: List[Spectator],
                                    currentRoundNumber: Int,
                                    questions: List[Question],
                                    replies: List[Reply]
                                    ){
    def currentRoundData: CurrentRoundData = {
      CurrentRoundData(currentQuestion, currentRoundNumber, players.map(_.userId))
    }

    private def currentQuestion: Question = questions.head

    def addReply(reply: Reply): PlayData = {
      if (replies.exists(_.userId == reply.userId)){
        this
      } else this.copy(replies = replies :+ reply)
    }

    private def findRoundWinner: Option[UserId] = {
      this.replies.find(_.answer == currentQuestion.correctAnswer).map(_.userId)
    }


    def isLastQuestion: Boolean = this.questions.size == 1

    def nextRound: PlayData = {
      assert(this.questions.size > 1)
      val playersWithUpdatedScore = findRoundWinner match {
        case None => this.players
        case Some(userId) =>
          this.players.foldLeft(List.empty[Player])((result, player) =>
              val p = if (player.userId == userId) then player.addScore(10) else player
              result :+ p
          )
      }
      this.copy(players = playersWithUpdatedScore,questions = questions.tail, replies = Nil)
    }
  }

  sealed trait RoomMessage

  case class ReadyToggle(userId: UserId) extends RoomMessage

  case class JoinRoom(userId: UserId) extends RoomMessage

  case object NextRound extends RoomMessage

  case class PlayerReply(userId: UserId, answer: Answer) extends RoomMessage

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

  case class UserReadyToggle(userId: UserId, isReady: Boolean, recipients: List[UserId]) extends OutgoingMessage {
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

  case class CurrentRoundData(question: Question, roundNumber: Int, recipients: List[UserId]) extends OutgoingMessage {
    override def toWsMessage: Message = {
      TextMessage.Strict(Json.obj(
        "tpe" -> OutgoingMessage.NEW_ROUND.asJson,
        "data" -> Json.obj(
          "roundNumber" -> roundNumber.asJson,
           "question" -> question.asJson
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
    Room(roomId, name, session, lobby).live(Data(List(owner), Nil))
  }
}
