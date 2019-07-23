const generateMessage = (text, username) => {
    return {
        text,
        from: username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (coords, username) => {
    return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        from: username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}