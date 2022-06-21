const express = require('express');
const cors = require('cors');
const db = require('./db');
const http = require('http');
const { Server } = require('socket.io');

const alarmRouter = require('./routes/alarm');
const authRouter = require('./routes/auth');
const verifyToken = require('./middlewares/auth').verifyToken;
const verifyAdmin = require('./middlewares/auth').verifyAdmin;
const getUserFromToken = require('./middlewares/auth').getUserFromToken;

db.connect();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let usersOnline = [];

app.set('io', io);

app.get('/users', verifyToken, verifyAdmin, (req, res) => {
  res.send(usersOnline);
});

io.on('connection', (socket) => {
  const id = socket.id;
  usersOnline.push({
    socketId: id,
    user: getUserFromToken(socket.handshake.headers.authorization),
  });

  const admin = usersOnline.find(({ user }) => user.role === 'admin');
  if (admin) {
    io.to(admin.socketId).emit('users:online-detailed', usersOnline);
  }
  socket.broadcast.emit('users:online', usersOnline.length);

  socket.emit('users:online', usersOnline.length);

  socket.on('disconnect', () => {
    usersOnline = usersOnline.filter(({ socketId }) => socketId !== id);

    const admin = usersOnline.find(({ user }) => user.role === 'admin');
    if (admin) {
      io.to(admin.socketId).emit('users:online-detailed', usersOnline);
    }

    socket.emit('users:online', usersOnline.length);
    socket.broadcast.emit('users:online', usersOnline.length);
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});

app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);
app.use('/alarm', verifyToken, alarmRouter);
