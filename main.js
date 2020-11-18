const Room = require('./Room');

const http = require('http').createServer();
const io = require('socket.io')(http);

const PORT = 4001

var rooms = {}

/* [TODO] handle existed rooms */
function createRoom(id, room) {
	if (!(room in rooms)) {
		rooms[room] = new Room(room);
		rooms[room].addConnection(id);
		sendData(room);
		return room
	}
	return
}

/* [TODO] handle not exist rooms */
function joinRoom(id, room) {
	if (room in rooms) {
		rooms[room].addConnection(id);
		return room
	}
	return
}

function leaveRoom(id, name) {

}

function addData(type, room, data) {
	console.log('New data:', room, data);
	rooms[room].setBioData('gsr', data);
}

function sendData(room) {
	let bioData = rooms[room].getBioData();
	console.log('bioData:', bioData);
	console.log('spoof Data:', rooms[room].getSpoofData());
	io.to(room).emit('bioData', bioData);

	/* Spoof data [TODO] move this spoof calculation part to client side */
	if (rooms[room].spoof['gsr'].on) {
		let spoofedInput = rooms[room].spoof['gsr'].value;
		let maxTop = spoofedInput+0.1;
		let minTop = spoofedInput-0.1;
		let randVal = Math.random() * (maxTop - minTop) + minTop;
		console.log('Original & Spoofed data:', bioData['gsr'].value, randVal.toFixed(2));
		bioData['gsr'].value = randVal.toFixed(2);
		io.to(room).emit('spoofedBioData', bioData);
		io.to(room).emit('displayData', bioData);
		rooms[room].setSpoofDataGSR((parseFloat(bioData['gsr'].value)));
	} else {
		io.to(room).emit('displayData', bioData);
	}

	if (room in rooms && rooms[room].numConnections > 0) {
		setTimeout(sendData, 1000, room)
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
  console.log('Setting Spoof GSR: ', bool, room);
  rooms[room].setSpoof('gsr', bool);
  io.to(room).emit('setSpoofGSR', bool)
}

function setSpoofValueGSR(room, data) {
	console.log('Setting Spoof GSR value: ', data, room);
	rooms[room].setSpoofValue('gsr', parseFloat(data));
	io.to(room).emit('setSpoofValueGSR', data)
}

function setClientShowing(room, element, value) {
	rooms[room].showClient[element] = value;
	io.to(room).emit('showToClient' + element, value);
}

function leaveRoom(id, room) {
	rooms[room].removeConnection(id);

	if (rooms[room].numConnections<1) {
		delete rooms[room];
	}

	console.log(id, 'disconnected.');
	console.log(rooms);
}

io.on('connection', (socket) => {
	console.log('a user connected');

	console.log('ID:', socket.id);

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
		console.log('joinRoom:', room_name);
		let room = joinRoom(socket.id, room_name);
		if(room=='undefined') {
			socket.to(socket.id).emit('err-room-not-exist');
		} else {
			socket.join(room);
		}
	});
	
	/* [TODO] handle remove from room */
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

	socket.on('gsrData', data => { addData('gsr', Object.keys(socket.rooms)[1], data); });

	socket.on('spoofBorder', bool => { setSpoofBorder(Object.keys(socket.rooms)[1], bool) });
	socket.on('spoofValue', value => { setSpoofValue(Object.keys(socket.rooms)[1], value) });
	socket.on('spoofGSR', bool => { setSpoofGSR(Object.keys(socket.rooms)[1], bool) });
	socket.on('spoofValueGSR', value => { setSpoofValueGSR(Object.keys(socket.rooms)[1], value) });

	socket.on('showToClientBorder', data => {setClientShowing('Border', Object.keys(socket.rooms)[1], data)});
	socket.on('showToClientStress', data => {setClientShowing('Stress', Object.keys(socket.rooms)[1], data)});
});

http.listen(PORT, () => {
	console.log('Listening on port', PORT);
});

process.on('uncaughtException', function (err) {
	console.error(err);
});