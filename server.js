const http = require('http');
const fs = require('fs');
const ws = new require('ws');

const wss = new ws.Server({noServer: true});

const clients = wss.clients;

function accept(req, res) {

  if (req.url == '/ws' && req.headers.upgrade &&
      req.headers.upgrade.toLowerCase() == 'websocket' &&
      // can be Connection: keep-alive, Upgrade
      req.headers.connection.match(/\bupgrade\b/i)) {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
  } else { // page not found
    res.writeHead(404);
    res.end();
  }
}

function onSocketConnect(ws) {
  //clients.add(ws);
  console.log(`new connection`);
  let nicks
  function sendMessage(message,ws){
    console.log(`message received: ${message}`);
    let msg = JSON.parse(message)
    switch(msg.event){
      case "new-login":
        ws.nick = msg.payload.nick
        nicks= Array.from(clients).map(c=>c.nick)
        ws.send(JSON.stringify({event:"new-login",payload:{nicks:nicks}}))
        updateNickList(ws,nicks);
      break;
      case "send-new-message":
        ws.send(message)
        updateSendedMessage(ws,msg)
      break;
    }
  }

  function updateSendedMessage(ws,msg){
    for(let client of clients) {
      if(client != ws){
        client.send(
          JSON.stringify(
            {event:"update-new-message",payload:{"nick":msg.payload.nick,"message":msg.payload.message}}
          )
        );
      }
    }
  }

  function updateNickList(ws,nicks){
    console.log(nicks)
    for(let client of clients) {
      if(client != ws){
        client.send(
        JSON.stringify({event:"update-nick-list",payload:{nicks:nicks}})
      );
      }
    }
  }

  ws.on('message', function(message) {
    sendMessage(message,ws);
  });

  ws.on('error',function(event){
    console.log(event);
  })

  ws.on('close', function() {
    console.log(`connection closed`);
    nicks = Array.from(clients).map(c=>c.nick)
    updateNickList(ws,nicks);
  });
}

http.createServer(accept).listen(8080);