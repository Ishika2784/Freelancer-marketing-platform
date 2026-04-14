const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/Freelancer');

// Attach io to app so routes can emit events
app.set('io', io);

// ── Socket.IO ──────────────────────────────────────────────────
// Map userId → socketId for direct delivery
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // Client sends their userId after connecting
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // join a room named by userId
  });
  socket.on('typing', ({ to, from }) => { io.to(to).emit('typing', { from }); });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
  });
});

// Expose helper to emit to a specific user
app.set('emitToUser', (userId, event, data) => {
  io.to(userId.toString()).emit(event, data);
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/authRoute'));
app.use('/api/payment', require('./routes/paymentRoute'));
app.use('/api/user',    require('./routes/userRoute'));
app.use('/api/jobs',    require('./routes/jobRoutes'));
app.use('/api/chat',    require('./routes/chatRoute'));

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
