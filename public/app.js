const sections = document.getElementsByTagName("section")
      const chat = document.getElementById("chat")
      const welcome = document.getElementById("welcome")

      function changeSection(section) {
        Array.from(sections).forEach((s) => {
          s.classList.remove("showSection");
        });
        section.classList.add("showSection");
      }

      let url = "ws://localhost:8080/ws";
      /**
       * @type {WebSocket}
       */
      let socket;

      // send message from the form
      document.forms.publish.onsubmit = function () {
        let outgoingMessage = JSON.stringify({
          event: "new-message",
          payload: {
            user: this.user.value,
            message: this.message.value,
          },
        });

        socket.send(outgoingMessage);
        return false;
      };

      const btnLogin = document.getElementById("btnLogin");
      btnLogin.addEventListener("click", () => {
        socket = new WebSocket(url);
        // handle incoming messages
        socket.onmessage = function (event) {
          showMessage(event.data);
        };

        socket.onclose = (event) => console.log(`Closed ${event.code}`);

        // show message in div#messages
        function showMessage(datastr) {
          let messageElem = document.createElement("div");
          let data = JSON.parse(datastr);
          switch (data.event) {
            case "open":
              console.log(data.payload.message);
              break;
            case "new-message":
              messageElem.textContent = `${data.payload.user}: ${data.payload.message}`;
              document.getElementById("messages").append(messageElem);
              break;
          }
        }

        changeSection(chat)
      });

      const btnLogout = document.getElementById("btnLogout")
      btnLogout.addEventListener("click",()=>{
        socket.close(1000,"close chat")
        changeSection(welcome)
      })