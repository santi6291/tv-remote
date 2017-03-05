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
		this.cec = new NodeCec('node-cec-monitor');
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
			this.log('killCec');
			this.cec.stop();
		}
		process.exit();
	}

	onReady(client){
		this.log('onReady');
		// @TODO
		// send scan and get hdmi names
		let response  = this.cec.sendCommand( 0xf0, this.cectypes.Opcode.GIVE_DEVICE_POWER_STATUS );
		response.on('data')
		setTimeout(()=>{
			this.log('setTimeout')
			this.cec.send('scan');
		}, 2000);

		response.on('data', (result)=>{
			this.log('data',result.toString())
		});
		// this.cec.client.stdout.on('data', (result)=>{
		// 	this.log('data',result.toString())
		// });
	}

	initBind(){
		this.log('initBind');
		// this.cec.on('REPORT_POWER_STATUS', (packet, status) => this.onReportPowerStatus(packet, status));
		// this.cec.on('ACTIVE_SOURCE', (packet, source) => this.onActiveSource(packet, source));
		// this.cec.on('STANDBY', (packet, source) => this.onStandby(packet, source));
		// this.cec.on('ROUTING_CHANGE', (packet, fromSource, toSource)=>this.onRoutingChange(fromSource, toSource));
	}

	onStandby(packet, source){
		this.log('onStandby');
		this.status.on = false;
		this.emit('standby', packet, source);
	}

	onActiveSource(packet, source){
		this.log('onActiveSource');
		this.status.on = true;
		this.emit('activeSource', packet, source);
	}

	onReportPowerStatus(packet, status){
		this.log('onReportPowerStatus');
		this.status.on = !Boolean(status);

		this.emit('reportPowerStatus');
	}
	
	onRoutingChange(fromSource, toSource){
		this.log('onRoutingChange');
		this.emit('routeChange', fromSource, toSource)
	}

	eventHandler(eventName){
		this.on('toggle-power', ()=>this.togglePower());
	}

	togglePower(){
		this.log('togglePower');
		let command = (this.status.on) ? this.cectypes.Opcode.STANDBY : this.cectypes.Opcode.IMAGE_VIEW_ON;
		console.log(command)
		return this.client.sendCommand(0xf0, command);
	}
}
module.exports = new CECcontroller();