require('dotenv').config()

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { getUser, getUsersInRoom, addUser, removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

io.on('connection', socket => {
    socket.on('sendMessage', (message, acknowledge) => {
        const user = getUser(socket.id)
        if (!user) return generateMessage('Message could not be sent')

        const filter = new Filter()
        if (filter.isProfane(message.text)) {
            return acknowledge('profanity')
        } else {
            io.to(user.room).emit('message', generateMessage(message.text, user.username))
            acknowledge('delivered')
        }
    })

    socket.on('shareLocation', (coords, acknowledge) => {
        const user = getUser(socket.id)
        if (!user) return generateMessage('Location could not be sent')

        io.to(user.room).emit('locationShared', generateLocationMessage(coords, user.username))
        acknowledge()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('userLeft', user.username)
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
    })

    socket.on('join', ({ username, room }, acknowledge) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) return acknowledge(error)

        socket.join(user.room)
        socket.emit('welcome', user.username)
        socket.broadcast.to(user.room).emit('userJoined', user.username)
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        acknowledge()        
    })
})

server.listen(port, () => {
    console.log(`\n > server running on port ${port}\n`)
})