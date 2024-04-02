package actor.session

import actor.session.UserManager.UserMessage
import message.OutgoingMessage
import message.OutgoingMessage.UserId
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}

object Lobby {
  
  sealed trait LobbyMessage
  
  case class Join(userId: String) extends LobbyMessage
  case class UserManagerGreeting(actorRef: ActorRef[UserMessage]) extends LobbyMessage
  
  case class SyncLobbyData(recipients: List[UserId]) extends OutgoingMessage {
    override def toWsMessage: Message = TextMessage.Strict(s"""
        {
          "tpe": 1,
          data: {
               "onlineCount": ${recipients.size},
               "rooms": [
                 {"roomId": 1,"usersCount": 3, isStarted: False},
                 {"roomId": 2,"usersCount": 0, isStarted: False},
                 {"roomId": 3,"usersCount": 0, isStarted: False},
                 {"roomId": 4,"usersCount": 2, isStarted: False}
               ]
          }
      }
      """) // FIXME
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

  private def live(data: Data, session: ActorRef[UserMessage]): Behavior[LobbyMessage] = Behaviors.receiveMessagePartial {
    case Join(userId) =>
      println(s"User $userId joined Lobby")
      val updatedData = data.joined(userId)
      session ! SyncLobbyData(updatedData.users.map(_.userId))
      live(updatedData, session)
  }

  private def postStart(): Behavior[LobbyMessage] = Behaviors.receiveMessagePartial {
    case UserManagerGreeting(actorRef) =>
      println(s"Greeting from UserManager")
      live(Data(Nil), actorRef)
  }
}
