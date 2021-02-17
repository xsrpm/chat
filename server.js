const http = require('http');
const fs = require('fs');
const ws = new require('ws');

const wss = new ws.Server({noServer: true});

const clients = new Set();

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
  clients.add(ws);
  console.log(`new connection`);
  ws.send(JSON.stringify({event:"open",payload:{user:"System",message:"Connected"}}))
  ws.on('message', function(message) {
    console.log(`message received: ${message}`);

    for(let client of clients) {
      client.send(message);
    }
  });

  ws.on('close', function() {
    console.log(`connection closed`);
    clients.delete(ws);
  });
}

http.createServer(accept).listen(8080);