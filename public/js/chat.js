const socket = io()

// Constants
const serverName = 'ChatApp Server 🤖'

// Elements
const $messageForm = document.getElementById('message-form')
const $inputField = document.querySelector('#message-form input[name=message]')
const $messageFormButton = document.getElementById('send-message')
const $messagesDiv = document.getElementById('messages')
const $shareLocationButton = document.getElementById('share-location')
const $sidebar = document.getElementById('sidebar')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const messageRedirectToHomeTemplate = document.getElementById('message-redirect-to-home-template').innerHTML
const rejectedMessageTemplate = document.getElementById('rejected-message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const addMessage = (message, emoji = '', redirectToHome = false) => {
    const template = redirectToHome ? messageRedirectToHomeTemplate : messageTemplate
    const isFromSelf = message.from === username
    const html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        emoji,
        side: isFromSelf ? 'self' : 'other',
        isFromSelf,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    $messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

const addRejectedMessage = originalMessage => {
    const html = Mustache.render(rejectedMessageTemplate, { originalMessage })
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    $messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

const addLocationMessage = data => {
    const url = `https://www.google.com/maps/search/${data.latitude},${data.longitude}`
    const html = Mustache.render(locationMessageTemplate, {
        url,
        latitude: data.latitude,
        longitude: data.longitude,
        from: data.from,
        createdAt: moment(data.createdAt).format('HH:mm')
    })
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    $messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

const renderSidebar = ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users })
    $sidebar.innerHTML = html
}

socket.on('message', (message) => {
    addMessage(message)
})

socket.on('welcome', username => {
    addMessage({ text: `🎉🎉🎉 Welcome, ${username.split(' ')[0]} 🎉🎉🎉`, from: serverName }, '')
})

socket.on('userJoined', (username, acknowledgement) => {
    addMessage({ text: `${username} joined`, from: serverName }, '😎')
})

socket.on('userLeft', (username, acknowledgement) => {
    addMessage({ text: `${username} left`, from: serverName }, '😟')
})

socket.on('locationShared', data => {
    addLocationMessage(data)
})


socket.on('roomData', ({ room, users }) => {
    renderSidebar({ room, users })

})

$messageForm.addEventListener('submit', ev => {
    ev.preventDefault()

    if (ev.target.elements.message.value) {
        $messageFormButton.setAttribute('disabled', 'disabled')

        const message = {
            text: ev.target.elements.message.value
        }

        $inputField.value = ''
        socket.emit('sendMessage', message, (acknowledgement) => {
            $messageFormButton.removeAttribute('disabled')
            switch (acknowledgement) {
                case 'profanity':
                    addRejectedMessage(message.message)
                    break;
                default:
                    console.log('The message was delivered')
                    break;
            }
        })
    }
    $inputField.focus()
})

$shareLocationButton.addEventListener('click', ev => {

    $shareLocationButton.setAttribute('disabled', 'disabled')
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            socket.emit('shareLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, acknowledgement => {
                $shareLocationButton.removeAttribute('disabled')
            });
        });

    } else {
        addMessage('Geolocation not supported')
    }
})

socket.emit('join', { username, room }, acknowledgement => {
    if (acknowledgement) {
        addMessage({ text: acknowledgement, from: serverName }, '🚫', true)
    }
})