const socket = io()


// Elements
const $messageForm = document.getElementById('message-form')
const $inputField = document.querySelector('#message-form input[name=message]')
const $messageFormButton = document.getElementById('send-message')
const $messagesDiv = document.getElementById('messages')
const $shareLocationButton = document.getElementById('share-location')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const rejectedMessageTemplate = document.getElementById('rejected-message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML

const addMessage = (message, emoji = '💬') => {
    const html = Mustache.render(messageTemplate, {
        text: message,
        emoji,
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
        createdAt: moment(data.createdAt).format('HH:mm')
    })
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    $messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

socket.on('message', (message) => {
    addMessage(message.text)
})

socket.on('welcome', () => {
    addMessage('🎉🎉🎉 Welcome 🎉🎉🎉', '')
})

socket.on('userJoined', () => {
    addMessage('A new user joined', '😎')
})

socket.on('userLeft', () => {
    addMessage('A user has left', '😟')
})

socket.on('locationShared', data => {
    addLocationMessage(data)
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
    console.log(1);

    $shareLocationButton.setAttribute('disabled', 'disabled')
    if ("geolocation" in navigator) {
        console.log(2);
        navigator.geolocation.getCurrentPosition(position => {
            console.log(3);
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