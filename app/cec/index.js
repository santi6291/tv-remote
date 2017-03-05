require('dotenv').config();

const wsCtrl = require('./lib/ws-controller');
const cecCtrl = require('./lib/cec-controller');


wsCtrl.on('onConnectionAccept', ()=>{
	wsCtrl.log('onConnectionAccept')
	wsCtrl.server.broadcastUTF(JSON.stringify(cecCtrl.status))

	cecCtrl.cec.once('REPORT_POWER_STATUS', (packet, status) => {
		cecCtrl.log('REPORT_POWER_STATUS', 'once')
	});
	cecCtrl.cec.on('REPORT_POWER_STATUS', (packet, status) => {
		cecCtrl.log('REPORT_POWER_STATUS', 'on')
	});
	// this.client.sendCommand('REPORT_POWER_STATUS');
});

// Handle client request for cec command
wsCtrl.on('onConnectionMessage', (message)=>{
	wsCtrl.log('onConnectionMessage')
	wsCtrl.server.broadcastUTF(message.utf8Data)
});


// broadcast route change
cecCtrl.on('routeChange', (fromSource, toSource)=>{
	cecCtrl.log('routeChange');
	let msg = JSON.stringify({fromSource, toSource});
	wsCtrl.server.broadcastUTF(msg)
});

 
// @TODO maybe bind these event and execute whenever they happend
/*const OpcodeKeys = Object.keys(cecCtrl.cectypes.Opcode)
const opCodeExclusion = ['GIVE_PHYSICAL_ADDRESS', ];
for (let i=0; i < OpcodeKeys.length; i++) {
	if (opCodeExclusion.indexOf(OpcodeKeys[i]) != -1) {
		continue;
	}

	cecCtrl.cec.on( OpcodeKeys[i], function () {
		cecCtrl.log(OpcodeKeys[i], arguments);
	})
}*/