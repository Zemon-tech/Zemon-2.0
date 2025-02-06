const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const createAdminUser = require('./seeds/adminSeed');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const ideaRoutes = require('./routes/ideas');
const chatRoutes = require('./routes/chat');
const meetingRoutes = require('./routes/meetings');
const resourceRoutes = require('./routes/resources');
const projectRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join idea room for real-time updates
  socket.join('ideas');

  // Handle user authentication for chat
  socket.on('authenticate', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} authenticated`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { chatId, userId } = data;
    socket.to(`chat_${chatId}`).emit('userTyping', { chatId, userId });
  });

  // Handle stop typing
  socket.on('stopTyping', (data) => {
    const { chatId, userId } = data;
    socket.to(`chat_${chatId}`).emit('userStoppedTyping', { chatId, userId });
  });

  // Join meeting room for updates
  socket.on('joinMeeting', (meetingId) => {
    socket.join(`meeting_${meetingId}`);
  });

  // Handle meeting chat messages
  socket.on('meetingMessage', (data) => {
    const { meetingId, message } = data;
    socket.to(`meeting_${meetingId}`).emit('newMeetingMessage', message);
  });

  // Join resources room for updates
  socket.join('resources');

  // Join projects room for updates
  socket.join('projects');

  // Handle task movement in project stages
  socket.on('moveTask', (data) => {
    const { projectId, taskId, fromStage, toStage } = data;
    socket.to('projects').emit('taskMoved', { projectId, taskId, fromStage, toStage });
  });

  socket.on('joinChat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Create admin user after successful connection
    await createAdminUser();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Team Management System API' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 