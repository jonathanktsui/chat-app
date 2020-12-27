(() => {
    let element = (id) => {
        return document.getElementById(id);
    }

    let status = element('status');
    let messages = element('messages');
    let textarea = element('textarea');
    let username = element('username');
    let clear = element('clear');

    let statusDefault = status.textContent;

    let setStatus = (s) => {
        status.textContent = s;

        if (s !== statusDefault) {
            let delay = setTimeout(() => {
                setStatus(statusDefault);
            }, 3000);
        }
    }

    let socket = io.connect('http://127.0.0.1:3000');

    if (socket !== undefined) {
        socket.on('output', (data) => {
            if (data.length) {
                for (let x = 0; x < data.length; x++) {
                    let message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name + ': ' + data[x].text;
                    messages.appendChild(message);
                }
            }
        });

        socket.on('status', (data) => {
            setStatus((typeof data === 'object') ? data.message : data);

            if (data.clear) {
                textarea.value = '';
            }
        });

        textarea.addEventListener('keydown', (event) => {
            if (event.which === 13 && event.shiftKey == false) {
                socket.emit('input', {
                    name: username.value,
                    text: textarea.value
                });

                event.preventDefault();
            }
        })

        clear.addEventListener('click', () => {
            socket.emit('clear');
        });

        socket.on('cleared', () => {
            messages.textContent = '';
        });
    }
})();