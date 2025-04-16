const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');

require('dotenv').config();

// Create a new HTTP server
const server = http.createServer();

// Create a new Socket.IO instance and attach it to the server
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Event handler for new socket connections
io.on('connection', (socket) => {
    console.log('A new client connected');

    // Event handler for receiving messages from clients
    socket.on('message', (data) => {
        console.log('Received message:', data);
        // Broadcast the message to all connected clients
        io.emit('message', data);
    });

    // Event handler for socket disconnections
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });

    io.emit('mo', { message: 'Hello from the server!' });
});

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once(   'open', () => {

const orderCollection = mongoose.connection.collection('orders');

const changeStream = orderCollection.watch();


changeStream.on('change', (change) => {
    console.log('Change detected:', change);

    if (change.operationType === 'insert') {
        const order = change.fullDocument;
        console.log('Order here is super power:', order);
        // Emit the new order to the specific user via Socket.IO
        io.emit('order', order);
    }
});
});

const port = 52388;
server.listen(port, () => {
    console.log(`Socket.IO server is running on port ${port}`);
});
