## Lobby flow
![Lobby Flow](lobby-flow.png)
## Common Server Message Structure:
   ```json
   "tpe": <int message type>,
   "data": {
     //Json object
   }
   ```
   Message types: <br/>
    - 0 -> Login Success <br/>
    - 1 -> Lobby Message <br/>
    - 2 -> Room Message <br/>
    - 3 -> Room Joined
    - 5 -> User Ready
    - 6 -> Game Started

- Json Message format:
  + Login Success:
      ```json
        {
              "tpe": 0,
              data: {
                   "sessionId": "3asdff#asd",
              }
       }
  + LobbyData: 
  ```json
    {
          "tpe": 1,
          "data": {
               "userCount": 3,
               "rooms": [
                 {"id": 1,"name": "room name", "usersCount": 3, "isStarted": false},
                 {"id": 2,"name": "room name", "usersCount": 0, "isStarted": false},
                 {"id": 3,"name": "room name","usersCount": 0, "isStarted": false},
                 {"id": 4,"name": "room name","usersCount": 2, "isStarted": false}
               ]
          }
   }
  ```
  + Room joined:
    ```json
       {
         "tpe": 3,
         "data": {
            "roomId": <int room ID>,
            "players": [
               {"userId":  "abc", "isReady":  false},
               {"userId":  "def", "isReady":  true}
            ]
         }
       }
   + User Ready

     ```json
     {
       "tpe": 5,
       "data": {
         "userId": <userId>,
         "userReady": true
       }
     }
     ```
    ```
## Common Client Message Structure
   ```json
      "tpe": <int message type>,
      "sessionId": <session ID>,
      "data": {
          //Json object
      }
   ```
   - Join Room request:
     ```json
         "tpe": 3,
         "sessionId": <session ID>,
         "data": {
            roomId: <int room ID>
         }
     ```

   - Create Room request:
      ```json
          "tpe": 4,
          "sessionId": <session ID>,
          "data": {
             "roomName": <room Name>
         }
      ```


   -  Ready request:
      ```json
          "tpe": 5,
          "sessionId": <session ID>,
          "roomId": <roomId>
         }
   
