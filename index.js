var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
//var nickname = new Object();
clients = [];
//let users = new Object();
users = [];
connections = [];
messages=[];
var dict = new Object;
//[hello, dfghhgfghj]
//[hello, dfghhgfghj]

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});

io.sockets.on('connection', function(socket){
    //io.emit('chat message', 'you are ' + `${socket.id}`);

    connections.push(socket);
    console.log('Connect: %s sockets connected', connections.length);

    socket.on('disconnect', function(data){
        if(!socket.username) return;
        users.splice(users.indexOf(socket.username), 1)
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length)
    });

    socket.on('new user', function(data, callback){
        callback(true);
        socket.username=socket.id;
        users.push(socket.username);
        clients.push(socket.username);
        updateUsernames();
        socket.on('chat message', function(msg){
            if(`${msg}`.includes('/nick')){
                for(i=0; i<users.length; i++){
                    if(socket.username !== users[i]){
                        console.log('not your username')
                    }else{
                        message=`${msg}`;
                        mesg=message.split(" ")[1]
                        io.emit('chat message', "your username has been changed to " + mesg);
                        socket.username=mesg;
                        users.splice(users.indexOf(socket.username), 1, socket.username);
                        updateUsernames1();
                    }

                }
                dict = users.map(function(v, i){
                    return{
                        key: v,
                        value: clients[i]
                    };
                });
                console.log(Object.values(dict));
            } 
        });
    });
    function updateUsernames(){
        io.emit('get users', users);
        for(i=0; i<messages.length; i++){
            socket.emit('chat message', messages[i]);
        } 
    }

    function updateUsernames1(){
        io.emit('get users', users);
    }

    socket.on('chat message', function(msg){
        var timestamp = new Date();
        var h = timestamp.getHours();
        var m = timestamp.getMinutes();
        var s = timestamp.getSeconds();
        timeStamp = h.toString() + ":" + m.toString() + ":" + s.toString();
        
        io.emit('chat message', `${timeStamp} ${socket.username}: ${msg}`);
        messages.push(`${timeStamp} ${socket.username}: ${msg}`);

      });
});

