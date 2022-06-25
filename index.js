const express = require('express');
const cors = require('cors');
const db = require('./db');
const http = require('http');
const { Server } = require('socket.io');
const Cron = require('cron').CronJob;
const alarmRouter = require('./routes/alarm');
const authRouter = require('./routes/auth');
const RedisService = require("./services/redis");
const SibService = require("./services/sib");
const User = require("./model/user");
const verifyToken = require('./middlewares/auth').verifyToken;
const verifyAdmin = require('./middlewares/auth').verifyAdmin;
const getUserFromToken = require('./middlewares/auth').getUserFromToken;

db.connect();

const app = express();
const server = http.createServer(app);
const redisService = new RedisService();
redisService.connect();
const io = new Server(server);
const sib = new SibService();


let usersOnline = [];

app.set('io', io);
app.set('redis', redisService);
app.set('sib', sib)

const emailJob = new Cron(
    '* * * * *',
    async function() {
      const user = await User.find();
      const res = await sib.sendEmails({
        email: 'ivantuer@gmail.com',
        name: 'Ivan',
      },  user.map(u => ({email: u.email}))
      , {subject: 'Cron scheduler Test',
            textContent: `
        Hi there, just a simple email to test CRON
        `,
            htmlContent: `
        <h1>Test</h1>
                `,});
     await redisService.set('emails', JSON.stringify({users: user.map(u => ({email: u.email})), success: true }))
      const redisGet = await redisService.get('emails')
      console.log(redisGet);
     const parsedEmailInfo = JSON.parse(redisGet || '{}')
      io.sockets.emit('lto',{operationName: 'emails', content: parsedEmailInfo, time: new Date().toISOString()})
    },
);

emailJob.start();

app.get('/users', verifyToken, verifyAdmin, (req, res) => {
  res.send(usersOnline);
});

io.on('connection', (socket) => {
  const id = socket.id;
  usersOnline?.push({
    socketId: id,
    user: getUserFromToken(socket.handshake.headers.authorization),
  });

  const admin = usersOnline?.find(({ user }) => user?.role === 'admin');
  if (admin) {
    io.to(admin.socketId).emit('users:online-detailed', usersOnline);
  }
  socket.broadcast.emit('users:online', usersOnline?.length);

  socket.emit('users:online', usersOnline?.length);

  socket.on('disconnect', () => {
    usersOnline = usersOnline?.filter(({ socketId }) => socketId !== id);

    const admin = usersOnline?.find(({ user }) => user.role === 'admin');
    if (admin) {
      io.to(admin.socketId).emit('users:online-detailed', usersOnline);
    }

    socket.emit('users:online', usersOnline?.length);
    socket.broadcast.emit('users:online', usersOnline?.length);
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});

app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);
app.use('/alarm', verifyToken, alarmRouter);
