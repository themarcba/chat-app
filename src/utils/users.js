const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean data
    if (username) username = username.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    if (room) room = room.trim().toLowerCase()

    // Validate data
    if (!username || !room) return {
        error: 'Username and room are required'
    }

    // Check for existing user
    const existingUser = users.find(user => {        
        return user.room === room && (user.username === username)
    })    

    // Validate username
    if (existingUser || username.toLowerCase() === 'server') return {
        error: 'Username is already in use',
        username
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
const getUser = id => {
    const user = users.find(user => user.id === id)
    return user
}

const getUsersInRoom = room => {
    const usersInRoom = users.filter(user => user.room === room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}