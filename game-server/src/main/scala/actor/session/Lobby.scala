package actor.session

import actor.session.UserManager.SessionMessage
import message.OutgoingMessage
import message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}

object Lobby {
  
  sealed trait LobbyMessage
  
  case class Join(userId: String) extends LobbyMessage
  case class UserManagerGreeting(actorRef: ActorRef[SessionMessage]) extends LobbyMessage
  
  private case class NotifyUserJoin(users: List[User]) extends OutgoingMessage{
    override def toWsMessage: Message = TextMessage.Strict("HAHAHHA")

    override def recipients: List[UserId] = users.map(_.userId)
  }

  case class SyncLobbyData(val recipient: UserId) extends OutgoingMessage {
    override def toWsMessage: Message = TextMessage.Strict("""
        {
          "tpe": 1,
          data: {
               "onlineCount": 8,
               "rooms": [
                 {"roomId": 1,"usersCount": 3, isStarted: False},
                 {"roomId": 2,"usersCount": 0, isStarted: False},
                 {"roomId": 3,"usersCount": 0, isStarted: False},
                 {"roomId": 4,"usersCount": 2, isStarted: False}
               ]
          }
      }
      """) // FIXME
    override def recipients: List[UserId] = List(recipient)
  }
  
  case class User(userId: String)
  
  case class Data(users: List[User]){
    def joined(userId: String): Data = {
      this.copy(users = this.users :+ User(userId))
    }
  }
  
  def apply(): Behavior[LobbyMessage] = {
     postStart()
  }

  private def live(data: Data, session: ActorRef[SessionMessage]): Behavior[LobbyMessage] = Behaviors.receiveMessagePartial {
    case Join(userId) =>
      println(s"User $userId joined Lobby")
      session ! NotifyUserJoin(data.users)
      session ! SyncLobbyData(userId)
      live(data.joined(userId), session)
  }

  private def postStart(): Behavior[LobbyMessage] = Behaviors.receiveMessagePartial {
    case UserManagerGreeting(actorRef) =>
      println(s"Greeting from UserManager")
      live(Data(Nil), actorRef)
  }
}
