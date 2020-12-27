const sockets = require('socket.io').listen(3000).sockets;
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost/chat-app';

mongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
    if (err) {
        throw err;
    }

    sockets.on('connection', (socket) => {
        let sendStatus = (status) => {
            socket.emit('status', status);
        }

        let messages = db.db('chat-app').collection('messages');

        messages.find().sort({_id:1}).toArray((err, res) => {
            if (err) {
                throw err;
            }
        
            socket.emit('output', res);
        });

        socket.on('input', (message) => {
            let name = message.name;
            let text = message.text;

            if (name == '' || text == '') {
                sendStatus('Please enter a name and message');
            }
            else {
                messages.insertOne({name, text}, () => {
                    sockets.emit('output', [message]);

                    sendStatus({ message: 'Message sent', clear: true });
                });
            }
        });

        socket.on('clear', () => {
            messages.removeMany({}, () => {
                socket.emit('cleared');
            });
        });
    });
});