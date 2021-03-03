class Room {
	constructor(room, bioData) {
		this.name = room;
		this.bioData = {'gsr': 0.0};
		this.showClient = {'Border': false, 'Stress': false};
		this.spoof = {'gsr': {on: false, value:1}}
		this.numConnections = 0;
		this.connections = [];
	}

	/**
	 * Get the room data for initializing room settings.
	 * @return {Object}			Room data including spoof & feedback settings.
	 */
	getRoomData() {
		let data = {spoof: this.spoof, showClient: this.showClient};
		return data;
	}
	
	/**
	 * Set the latest biodata of a given type.
	 * @param {string} type		Type of the data. e.g., gsr
	 * @param {string} value	Data value.
	 */
	setBioData(type, value) {
		let val = parseFloat(value);
		this.bioData[type] = val;
	}

	/**
	 * Get the latest value of a given biodata.
	 * @param {string} type		Type of the data.
	 * @return {string} 		The latest value of biodata of the given type.
	 */
	getBioData(type) {
		if(typeof type==='undefined') {
			return this.bioData;
		}
		return this.bioData[type];
	}

	/**
	 * Set the current status of the spoof function for the biodata of a given type.
	 * @param {string} type		Type of the data.
	 * @param {bool} bool		True/false if the spoof function should be on/off.
	 */
	setSpoof(type, bool) {
		this.spoof[type].on=bool;
	}

	/**
	 * Set the current spoof value for the biodata of a given type.
	 * @param {string} type		Type of the data.
	 * @param {float} val		Spoof value.
	 */
	setSpoofValue(type, val) {
		this.spoof[type].value=val;
	}

	/**
	 * Add an ID and increase the number of connection in the room.
	 * @param {string} id		Connection ID.
	 */
	addConnection(id) {
		if (!this.connections.includes(id)) {
			this.connections.push(id);
			this.numConnections += 1;
		}
	}

	/**
	 * Remove an ID and decrease the number of connection in the room.
	 * @param {string} id		Connection ID.
	 */
	removeConnection(id) {
		this.connections.splice(this.connections.indexOf(id), 1);
		this.numConnections -= 1;
	}

}

module.exports = Room;