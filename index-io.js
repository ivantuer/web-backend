const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const usersOnline = [];

app.set('io', io);

app.get('/', (req, res) => {
  const io = req.app.get('io');
  io.sockets[usersOnline[0]].emit('hello', 'everyone');
  res.send('hello');
});

io.on('connection', (socket) => {
  const id = socket.id;
  usersOnline.push(id);
  socket.on('message', () => {
    socket.emit('hello', { some: 'data' });
  });
  socket.broadcast.emit('hello all', usersOnline);
});

io.on('disconnection', (socket) => {
  const id = socket.id;
  usersOnline = usersOnline.filter((i) => i !== id);
  socket.on('message', () => {
    socket.emit('hello', { some: 'data' });
  });
  socket.broadcast.emit('hello all', usersOnline);
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});
