require('dotenv').config()

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

let count = 0

io.on('connection', socket => {
    console.log('new websocket connection');

    // socket.emit('welcome')
    socket.emit('welcome')
    socket.broadcast.emit('userJoined')

    // socket.emit('countUpdated', count)

    socket.on('sendMessage', (message, acknowledge) => {        
        const filter = new Filter()
        if (filter.isProfane(message.text)) {
            return acknowledge('profanity')
        } else {
            io.emit('message', generateMessage(message.text))
            acknowledge('delivered')
        }
    })

    socket.on('shareLocation', (coords, acknowledge) => {
        io.emit('locationShared', generateLocationMessage(coords))
        acknowledge()
    })

    socket.on('disconnect', () => {
        io.emit('userLeft')
    })
})

server.listen(port, () => {
    console.log(`\n > server running on port ${port}\n`)
})