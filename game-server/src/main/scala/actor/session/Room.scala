package actor.session

import actor.session.Room.Data
import message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.ActorRef
import org.apache.pekko.actor.typed.Behavior
import message.OutgoingMessage
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import actor.session.Room.RoomMessage
import actor.session.Room.Join
import actor.session.Room.Ready
import actor.session.UserManager.UserMessage

case class Room(data: Data, session: ActorRef[UserMessage]){
  def live: Behavior[RoomMessage] = Behaviors.receiveMessage({
    case Join(userId) => 
      println(s"UserId $userId joined room ${data.name}")
      this.copy(data = data.userJoin(userId)).live
    case Ready(userId) =>
      this.copy(data = data.userReady(userId)).live

  })
}
object Room {
  private val MAX_PLAYERS = 3

case class Data(name: String, players: List[Player], spectators: List[Spectator]) {
  def userJoin(userId: UserId): Data = {
    if (players.size == MAX_PLAYERS){
      this.copy(spectators = this.spectators :+ Spectator(userId))
    } else {
      this.copy(players = this.players :+ Player(userId, isReady = false, score = 0))
    }
  }

  def userReady(userId: UserId): Data = {
    this.players.find(_.userId == userId) match {
      case None => this
      case Some(player) => 
        val updatedPlayers = players.filterNot(_.userId == userId) :+ player.ready
        this.copy(players = updatedPlayers)
    }
  }
}

case class Player(userId: UserId, isReady: Boolean, score: Int){
  def ready: Player = this.copy(isReady = true)
}
case class Spectator(userId: UserId)

sealed trait RoomMessage
case class Ready(userId: String) extends RoomMessage
case class Join(userId: String) extends RoomMessage

def create(name: String, owner: Player, session: ActorRef[UserMessage]): Behavior[RoomMessage] = {
  Room(Data(name, List(owner), Nil), session).live
}
}
