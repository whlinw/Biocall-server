const Room = require('./Room');
const winston = require('winston');
require('winston-daily-rotate-file');

var argv = require('minimist')(process.argv.slice(2));

var app = require('http').createServer();
if (argv.https){
	var fs = require('fs');
	var key = './cert/pvkey.pem';
	var cert = './cert/cert.crt';
	if (argv.key) { key = argv.key; }
	if (argv.cert) { cert = argv.cert; }
	var options = {
		key: fs.readFileSync(key),
		cert: fs.readFileSync(cert)
	}
	app = require('https').createServer(options);
}
const io = require('socket.io')(app);

var PORT = 4001;
if (argv.port){
	PORT = argv.port;
}

var logger = require('console')
if (!argv.stdlog) {

	var logPath = '/var/log/biocall-server'
	if (argv.dev) {
		logPath = './log'
	}

	logger = winston.createLogger({
		format: winston.format.combine(winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), winston.format.json()),
		transports: [
			new (winston.transports.DailyRotateFile)({
				level: 'info',
				filename: logPath + '/info-%DATE%.log',
				datePattern: 'YYYY-MM-DD',
				zippedArchive: true,
				maxSize: '20m',
				maxFiles: '14d'
			}),
			new (winston.transports.DailyRotateFile)({
				level: 'error',
				filename: logPath + '/error-%DATE%.log',
				datePattern: 'YYYY-MM-DD',
				zippedArchive: true,
				maxSize: '20m',
				maxFiles: '14d'
			})
		],
	});
}

var rooms = {};
var guestList = {};

/**
 * Add a connection to a room. A new room is created if the room is not existed.
 * @param {string} id		Connection ID.
 * @param {string} room		Name of the room.
 * @param {Object} socket	Socket object of the connection.
 * @return {int}			Number of connection in the room.
 */
function joinRoom(id, room, socket) {
	if (!(room in rooms)) {
		logger.info('Room [' + room + '] not exists. Creating a new room ...');
		rooms[room] = new Room(room);
		logger.info('New room [' + room + '] created. Current rooms: ' + Object.keys(rooms));
		rooms[room].addConnection(id);
		sendData(room, socket);
	} else {
		rooms[room].addConnection(id);
		let roomData = rooms[room].getRoomData();
		socket.emit('initRoom', roomData);
	}
	guestList[id] = room;
	return rooms[room].numConnections;
}

/**
 * Set the biodata of a given type of a room.
 * @param {string} type		Type of the data.
 * @param {string} room		Name of the room.
 * @param {string} data		Data value.
 */
function addData(type, room, data) {
	rooms[room].setBioData(type, data);
}

/**
 * Send all the latest biodata to all users in a room.
 * @param {string} room		Name of the room.
 * @param {Object} socket	Socket object of the user that provides biodata.
 */
function sendData(room, socket) {
	if (typeof(rooms[room])==='undefined') {
		return;
	}
	let bioData = rooms[room].getBioData();
	io.to(room).emit('bioData', bioData);

	if (rooms[room].spoof['gsr'].on) {
		let spoofedInput = rooms[room].spoof['gsr'].value;
		let maxTop = spoofedInput+0.1;
		let minTop = spoofedInput-0.1;
		let randVal = Math.random() * (maxTop - minTop) + minTop;
		let spoofDataGSR = randVal.toFixed(2);
		io.to(room).emit('spoofDataGSR', spoofDataGSR);
	}

	if (socket.connected) {
		if (room in rooms && rooms[room].numConnections > 0) {
			setTimeout(sendData, 1000, room, socket);
		}
	}
}

/**
 * Start/Stop the GSR spoof function of a room.
 * @param {string} room		Name of the room.
 * @param {bool} bool		True/false for start/stop.
 */
function setSpoofGSR(room, bool) {
  rooms[room].setSpoof('gsr', bool);
  io.to(room).emit('setSpoofGSR', bool);
}

/**
 * Set the GSR spoof value of a room.
 * @param {string} room		Name of the room.
 * @param {string} data		Spoof value.
 */
function setSpoofValueGSR(room, data) {
	rooms[room].setSpoofValue('gsr', parseFloat(data));
}

/**
 * Set biofeedback to be visible/invisible to the client of a room. 
 * @param {string} room		Name of the room.
 * @param {string} type		Type of feedback. 
 * @param {bool} bool		Data value.
 */
function setClientShowing(room, type, bool) {
	rooms[room].showClient[type] = bool;
	io.to(room).emit('showToClient' + type, bool);
}

io.on('connection', (socket) => {
	logger.info('New socket connection: [' + socket.id + ']');

	socket.on('role', data => {
		logger.info('Client [' + socket.id + '] registered as ' + data.toUpperCase() + '.');
	});

	socket.on('joinRoom', room_name => {
		logger.info('Client [' + socket.id + '] requests to join room [' + room_name + '] ...');
		let numConn = joinRoom(socket.id, room_name, socket);
		socket.join(room_name);
		logger.info('Client [' + socket.id + '] joins room [' + room_name + ']. Connections in room [' + room_name + ']: ' + numConn);
	});

	socket.on('disconnect', () => {
		let room = guestList[socket.id];
		logger.info('Client [' + socket.id + '] from room [' + room + '] disconnected. Removing client from the room ...');
		try {
			rooms[room].removeConnection(socket.id);
			delete guestList[socket.id];
		}
		catch(err) {
			logger.error('Error:', err);
		}
		logger.info('Client [' + socket.id + '] removed from room [' + room + ']. Connections in room [' + room + ']: ' + rooms[room].numConnections);

		// Check and delete the room if there is no connection in a room.
		if (rooms[room].numConnections==0) {
			delete rooms[room];
			logger.info('Room [' + room + '] removed. Current rooms: ' + Object.keys(rooms));
		}
	});

	socket.on('gsrData', data => {addData('gsr', Object.keys(socket.rooms)[1], data); });
	socket.on('hrData', data => {addData('hr', Object.keys(socket.rooms)[1], data); });

	socket.on('spoofGSR', bool => { setSpoofGSR(Object.keys(socket.rooms)[1], bool) });
	socket.on('spoofValueGSR', value => { setSpoofValueGSR(Object.keys(socket.rooms)[1], value) });

	socket.on('showToClientBorder', data => {setClientShowing(Object.keys(socket.rooms)[1], 'Border', data)});
	socket.on('showToClientStress', data => {setClientShowing(Object.keys(socket.rooms)[1], 'Stress', data)});
});

process.on('uncaughtException', function (err) {
  logger.error('Caught exception: ' + err);
});

app.listen(PORT, () => {
	logger.info('Server started. Listening on port ' + PORT);
});