const Room = require('./Room');

const http = require('http').createServer();
const io = require('socket.io')(http);

const PORT = 4001

var rooms = {}
var guestList = {}

/* [TODO] handle existed rooms / REMOVE */
function createRoom(id, room, socket) {
	if (!(room in rooms)) {
		rooms[room] = new Room(room);
		rooms[room].addConnection(id);
		sendData(room, socket);
		return room
	}
	return
}

/* [TODO] handle not exist rooms */
function joinRoom(id, room, socket) {
	if (!(room in rooms)) {
		rooms[room] = new Room(room);
		rooms[room].addConnection(id);
		sendData(room, socket);
	} else {
		rooms[room].addConnection(id);
	}
	guestList[id] = room;
	console.log('JoinRoom:', rooms);
}

function addData(type, room, data) {
	console.log('New data:', room, data);
	rooms[room].setBioData('gsr', data);
}

function sendData(room, socket) {
	let bioData = rooms[room].getBioData();
	io.to(room).emit('bioData', bioData);

	/* Spoof data [TODO] move this spoof calculation part to client side */
	if (rooms[room].spoof['gsr'].on) {
		let spoofedInput = rooms[room].spoof['gsr'].value;
		let maxTop = spoofedInput+0.1;
		let minTop = spoofedInput-0.1;
		let randVal = Math.random() * (maxTop - minTop) + minTop;
		bioData['gsr'].value = randVal.toFixed(2);
		io.to(room).emit('spoofedBioData', bioData);
		io.to(room).emit('displayData', bioData);
		rooms[room].setSpoofDataGSR((parseFloat(bioData['gsr'].value)));
	} else {
		io.to(room).emit('displayData', bioData);
	}

	if (socket.connected) {
		if (room in rooms && rooms[room].numConnections > 0) {
			setTimeout(sendData, 1000, room, socket)
		}
	}
}

function setSpoofBorder(room, bool) {
	console.log('Started spoofing: ' + bool);
	rooms[room].setSpoof('border', bool);
	io.to(room).emit('spoofBorder', bool);
}

function setSpoofValue(room, data) {
	rooms[room].setSpoofValue('border', parseFloat(data));
	io.to(room).emit('spoofValue', data);
}

function setSpoofGSR(room, bool) {
  rooms[room].setSpoof('gsr', bool);
  io.to(room).emit('setSpoofGSR', bool)
}

function setSpoofValueGSR(room, data) {
	rooms[room].setSpoofValue('gsr', parseFloat(data));
	io.to(room).emit('setSpoofValueGSR', data)
}

function setClientShowing(room, element, value) {
	rooms[room].showClient[element] = value;
	io.to(room).emit('showToClient' + element, value);
}

io.on('connection', (socket) => {
	socket.on('createRoom', name => {
		console.log('createRoom:', name);
		let room = createRoom(socket.id, name);
		if(room=='undefined') {
			socket.to(socket.id).emit('err-room-already-exist');
		} else {
			socket.join(room);
		}
	});

	socket.on('joinRoom', room_name => {
		joinRoom(socket.id, room_name, socket);
		socket.join(room_name);
		console.log('User', socket.id, 'connected and joined Room', room_name);
	});
	
	/* [TODO] handle remove from room */
	/*
	socket.on('disconnect', name => {
		console.log('user disconnected');
		try {
			console.log(socket.id);
		  	console.log(socket.rooms);
		} catch(e) {
			console.log(e);
		}
		leaveRoom(socket.id, Object.keys(socket.rooms)[1]);
	});
	*/

	socket.on('disconnect', () => {
		let room = guestList[socket.id]
		try {
			rooms[room].removeConnection(socket.id);
			delete guestList[socket.id];
		}
		catch(err) {
			console.log('Error:', err);
		}
		checkRoom(room);
		console.log('Socket.io: Client disconnected on port ' + PORT);
		console.log('Rooms:', rooms);
	});

	socket.on('gsrData', data => { addData('gsr', Object.keys(socket.rooms)[1], data); });

	socket.on('spoofBorder', bool => { setSpoofBorder(Object.keys(socket.rooms)[1], bool) });
	socket.on('spoofValue', value => { setSpoofValue(Object.keys(socket.rooms)[1], value) });
	socket.on('spoofGSR', bool => { setSpoofGSR(Object.keys(socket.rooms)[1], bool) });
	socket.on('spoofValueGSR', value => { setSpoofValueGSR(Object.keys(socket.rooms)[1], value) });

	socket.on('showToClientBorder', data => {setClientShowing('Border', Object.keys(socket.rooms)[1], data)});
	socket.on('showToClientStress', data => {setClientShowing('Stress', Object.keys(socket.rooms)[1], data)});
});

function checkRoom(room) {
	if (rooms[room].numConnections==0) {
		delete rooms[room];
	}
}

http.listen(PORT, () => {
	console.log('Listening on port', PORT);
});

process.on('uncaughtException', function (err) {
	console.error(err);
});