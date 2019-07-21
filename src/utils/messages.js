const generateMessage = text => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = coords => {
    return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}