
//Başlangıçta benim profilimde yazan her şey anlamsız karakterlerden oluşsun. Aşağıdaki gibi ama daha güzel görünen.

//https://coolsymbol.com/
//bu siteden alınabilir.

//#$^^&#%&^%**^#%*#$%&%$&%$*%$&%$^#^%*$#%#@%$%&%$$#&**()&)($^%&%$^@$%!^$%^$%^^%@^%@%&#%&&%#%^*@%$^$#%@*

//Web URL'nin sonuna ?number= query stringi eklendiği zaman sayfa Webrtc ile birbirine bağlanmaya çalışıyor library üzerinden.
//number=462 ise bağlanmaya çalıştıkları odanın adı "flying462sheep" olabilir.
//İki tab birbirine bağlanınca arka plan renklerinin yeri tam zıttı olsun ikisinde de.
//Birisinde mouse hareket ettirince diğerinde bir top hareket etsin

const io = require('socket.io')();
const express = require('express');
var app = express();
var http = require('https').createServer(app);

io.attach(http, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

var rooms = {};

io.on('connection', (socket) => {
  console.log("socket connected!");
  socket.on('register', (key) => {
    if (key) {
      socket.gameKey = key;
      rooms[key] = rooms[key] || [];
      if (rooms[key].length >= 2) {
        socket.disconnect();
        return;
      }
      rooms[key].push(socket);
      if (rooms[key].length === 2) {
        var otherSocket = rooms[key][0];
        otherSocket.otherSocket = socket;
        socket.otherSocket = otherSocket;
        console.log("sockets are connected to each other with key " + key);
      }
    }
  });

  socket.on('mouse', (pos) => {
    if (socket.otherSocket) {
      socket.otherSocket.emit("mouse", pos);
    }
  });
  socket.on('disconnect', (reason) => {
    rooms[socket.gameKey] = null;
    if (socket.otherSocket) {
      rooms[socket.gameKey] = [socket.otherSocket];
      socket.otherSocket.otherSocket = null;
      socket.otherSocket = null;
    }
  });
});


app.use(express.static('public'));

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });
const port = process.env.PORT || 3000;
http.listen(port, function () {
  console.log('listening on *:' + port);
});