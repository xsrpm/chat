const ws = new require('ws');
const express = require('express')
const app = express()

const wss = new ws.Server({noServer: true});

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get('/ws', (req, res) => {
  if(req.headers.upgrade &&
      req.headers.upgrade.toLowerCase() == 'websocket' &&
      // can be Connection: keep-alive, Upgrade
      req.headers.connection.match(/\bupgrade\b/i)){
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
      }
});

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

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})