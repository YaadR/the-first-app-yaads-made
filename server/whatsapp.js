import { Client } from 'whatsapp-web.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import qrcode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let isClientReady = false;

client.on('qr', async (qr) => {
  try {
    const qrImage = await qrcode.toDataURL(qr);
    io.emit('qr', qrImage);
  } catch (err) {
    console.error('Error generating QR code:', err);
  }
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  isClientReady = true;
  io.emit('ready');
});

client.on('authenticated', () => {
  console.log('WhatsApp client is authenticated!');
  io.emit('authenticated');
});

client.on('auth_failure', () => {
  console.log('Auth failure, restarting...');
  io.emit('auth_failure');
});

client.initialize().catch(err => {
  console.error('Failed to initialize WhatsApp client:', err);
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  if (isClientReady) {
    socket.emit('ready');
  }

  socket.on('send-message', async ({ phone, message }) => {
    try {
      if (!isClientReady) {
        socket.emit('error', 'WhatsApp client not ready');
        return;
      }

      // Format phone number
      const formattedNumber = phone.replace(/\D/g, '');
      const chatId = `${formattedNumber}@c.us`;

      await client.sendMessage(chatId, message);
      socket.emit('message-sent', { phone });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});