import actor.Root
import org.apache.pekko.actor.typed.ActorSystem
import scala.io.StdIn

object Main {
  def main(args: Array[String]): Unit = {
    ActorSystem(Root(), "game-server")
    StdIn.readLine()
  }
}