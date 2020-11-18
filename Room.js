class Room {
	constructor(room, bioData) {
		this.name = room;
		this.bioData = {'gsr': {value: 0.0, min: 0, max: 1}}
		this.showClient = {'border': false, 'stress': false};
		this.spoof = {'border': {on: false, value: 0}, 'gsr': {on: false, value:1}}
		this.numConnections = 0;
		this.connections = [];
	}
/*
	{
		bioData: {gsr: '1.2', gsrHistory: {minVal:0, maxVal:1}},
		showToClientBorder: false,
		showToClientStressChart: false,
		spoofBorder: false,
		spoofValue: 0,
		spoofGSR: false,
		spoofedGSRVal: 1,
	}
*/
	/**
	 * Set BioData of name with a single value
	 * @param {string} name - Name of the data
	 * @param {TYPE} value - Data value
	 */
	setBioDataSingleValue(name, value) {
		let val = parseFloat(value);
		this.bioData[name].value = val;

		/* set history (min & max) */
		if (val > this.bioData[name].max) {
			this.bioData[name].max = val;
		} else if (val < this.bioData[name].min) {
			this.bioData[name].min = val;
		}
	}

	/*
	setBioData(name, data) {
		this.bioData[name] = data;
	}
	*/

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

	setSpoofDataGSR(val) {
		if (this.spoof['gsr'].on) {
			let num = parseFloat(val);
			if (num > this.bioData['gsr'].max) {
				this.bioData['gsr'].max = num;
			} else if (num < this.bioData['gsr'].min) {
				this.bioData['gsr'].min = num;
			}
		}
	}

	addConnection(id) {
		this.connections.push(id);
		this.numConnections += 1;
	}

	removeConnection(id) {
		this.connections.splice(this.connections.indexOf(id), 1);
		this.numConnections -= 1;
	}

	getSpoofData(name) {
		return this.spoof;
	}
}

module.exports = Room;