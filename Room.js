class Room {
	constructor(room, bioData) {
		this.name = room;
		this.bioData = {'gsr': 0.0}
		this.showClient = {'Border': false, 'Stress': false};
		this.spoof = {'gsr': {on: false, value:1}}
		this.numConnections = 0;
		this.connections = [];
	}
	
	/**
	 * Set BioData of name with a single value
	 * @param {string} name - Name of the data
	 * @param {TYPE} value - Data value
	 */
	setBioData(name, value) {
		let val = parseFloat(value);
		this.bioData[name] = val;
	}

	getBioData(name) {
		if(typeof name==='undefined') {
			return this.bioData;
		}
		return this.bioData[name];
	}

	setSpoof(name, bool) {
		this.spoof[name].on=bool;
	}

	setSpoofValue(name, val) {
		this.spoof[name].value=val;
	}

	addConnection(id) {
		if (!this.connections.includes(id)) {
			this.connections.push(id);
			this.numConnections += 1;
		}
	}

	removeConnection(id) {
		this.connections.splice(this.connections.indexOf(id), 1);
		this.numConnections -= 1;
	}

}

module.exports = Room;