
const FINAL_KEY = "VERYSPECIALCODE";

const io = require('socket.io')();
const express = require('express');
var app = express();
var http = require('http').createServer(app);

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
      //If he gives us Final Key with a time earlier than 30 seconds, we finish the game.
      if (key.split()[0] === FINAL_KEY && (new Date(key.split()[1])).getTime() < Date.now() - 30000) {
        finishHim(socket);
        return;
      }
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
      socket.mouse = pos;
      if (socket.otherSocket.mouse) {
        const m1 = pos;
        const m2 = socket.otherSocket.mouse;
        if (m1.draggingLeft && m2.draggingRight || m2.draggingLeft && m1.draggingRight) {
          socket.emit("run", "MouseForcePerPixel = 0.2;");
          socket.otherSocket.emit("run", "MouseForcePerPixel = 0.2;");
        } else {
          socket.emit("run", "MouseForcePerPixel = 0.1;");
          socket.otherSocket.emit("run", "MouseForcePerPixel = 0.1;");
        }
        if (m1.draggingLeft && m2.draggingRight && m1.x < -300 && m2.x > 300 || m2.draggingLeft && m1.draggingRight && m2.x < -300 && m1.x > 300) {

          const openDoorScript = `
            window.onbeforeunload = () => {
              localStorage.setItem("mysecret", "${FINAL_KEY} " + Date.now());
            };
            document.getElementById("avatarLink").href = "https://serverfault.com/questions/32787/where-did-wait-30-seconds-before-turning-it-back-on-come-from";
            leftDoor.moveTo(doorBorder.getX() - 200);
            rightDoor.moveTo(doorBorder.getX() + 420);
          `;

          socket.emit("run", openDoorScript);
          socket.otherSocket.emit("run", openDoorScript);
          //the door is open!

        }
      }
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

function finishHim(socket) {


  const myProfileInfo = [`
    <header>
								<img src="./assets/images/avatar_hasan.png" width="195" height="160">
								<h1>Hasan</h1>

								<aside class="links">
									<a href="mailto:HasanTekin_@hotmail.com.tr" title="E-mail">
										<img src="./assets/images/icon_m.png" width="36" height="36" alt="E-mail">
									</a>
									<a href="https://www.linkedin.com/in/hasantekin/" target="_blank" title="Linkedin profile">
										<img src="./assets/images/icon_s_l.png" width="36" height="36" alt="Linkedin profile">
									</a>
								</aside>
							</header>`,
    `<p>Software Developer | Game Designer</p>`,
    `<aside>
								<table>
									<thead>
										<tr>
											<th>
												<h1>Skills</h1>
											</th>
											<th>Lvl</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Algoritm Expertise</td>
											<td>Turn leight</td>
										</tr>
										<tr>
											<td>Telekinesis</td>
											<td>WebRTC</td>
										</tr>
										<tr>
											<td>Philosophy</td>
											<td>???</td>
										</tr>
									</tbody>
								</table>
							</aside>`,
    `<p>His first coding was on a C64 at age 12. He precisely printed sum of 2 and 3.</p>`,
    `<p>As soon as he learned programming he started developing games. He is very into physics
								games so he worked on 2D physics games most of the time. He also really enjoy beaming
								electrons from one device to another and he turned his first snake game into a local
								multiplayer game in high school.</p>`,
    `<p>After many small games, he founded his own company by getting an R&D fund from the
								government to develop his biggest game project. He made mistakes by over-developing,
								lost his motivation, left his company and started searching for the meaning of life.</p>`,
    `<aside class="funFacts">
								<h1>Fun Facts</h1>
								<p>In high school, he made a chat program using FTP only to be able to chat with his
									girlfriend whose workplace had blocked messengers.</p>
							</aside>`,
    `<aside class="funFacts">
								<h1>Favourite Games</h1>
								<p>
									Dune II · Prince Of Persia · Michael Jackson's Moonwalker (Sega Genesis)
								</p>
							</aside>`,
    `<aside class="funFacts">
								<p>
									<q>If you don't create your own meaning, someone else will do it for you.</q>
								</p>
							</aside>`
  ];


  socket.emit("run", `
  document.getElementById("divMyProfile").innerHtml = "";
`);

  var index = 0;
  var interval = setInterval(() => {
    socket.emit("run", `
      document.getElementById("divMyProfile").innerHtml = document.getElementById("divMyProfile").innerHtml + "${myProfileInfo[index]}";
    `);
    index++;
    if(index >= myProfileInfo.length - 1)
      clearInterval(interval);
  }, 1000)
}

app.use(express.static('public'));

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });
const port = process.env.PORT || 3000;
http.listen(port, function () {
  console.log('listening on *:' + port);
});