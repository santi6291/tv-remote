const Helper = require('../../shared');
// cec types
// node-cec/lib/lib/cectypes.js
class CECcontroller extends Helper {
	// -------------------------------------------------------------------------- //
	// Example: basic.js
	// For more cec-events: http://www.cec-o-matic.com/
	// -------------------------------------------------------------------------- //
	constructor(){
		super('cec')
		const nodecec = require('node-cec');
		const NodeCec = nodecec.NodeCec;
		
		this.cectypes = nodecec.CEC;
		this.cec = new NodeCec( 'node-cec-monitor' );
		this.client;
		this.status = {
			on: false,
			source: 0,
		}
	
		// -------------------------------------------------------------------------- //
		//- CEC EVENT HANDLING
		this.cec.once( 'ready', (client)=>this.onReady(client));
		this.initBind();
		
		// -------------------------------------------------------------------------- //
		// -m  = start in monitor-mode
		// -d8 = set log level to 8 (=TRAFFIC) (-d 8)
		// -br = logical address set to `recording device`
		this.cec.start('cec-client', '-m', '-d', '8', '-b', 'r')
	}
	
	// -------------------------------------------------------------------------- //
	//- KILL CEC-CLIENT PROCESS ON EXIT
	killOnExit(){
		process.on('SIGINT', () =>this.killCec());
	}

	killCec(){
		if ( this.cec != null ) {
		  this.cec.stop();
		}
		process.exit();
	}

	onReady(client){
		this.log( ' -- READY -- ' );
		this.client = client;
		this.client.sendCommand( 0xf0, this.cectypes.Opcode.GIVE_DEVICE_POWER_STATUS );
	}

	initBind(){
		this.cec.on('REPORT_POWER_STATUS', (packet, status) => this.powerStatusCallback(packet, status));
		this.cec.on('ACTIVE_SOURCE', (packet, source) => this.powerStatusCallback(packet, source));
		this.cec.on('ROUTING_CHANGE', (packet, fromSource, toSource)=>this.emit('routeChange', fromSource, toSource));
	}

	powerStatusCallback(packet, status){
		this.log(status)
		var keys = Object.keys( this.cectypes.PowerStatus );

		for (var i = keys.length - 1; i >= 0; i--) {
			if (this.cectypes.PowerStatus[keys[i]] == status) {
				// this.status.on = (keys[i] == 'ON')?  true : false;
				break;
			}
		}
	}
}
module.exports = new CECcontroller();