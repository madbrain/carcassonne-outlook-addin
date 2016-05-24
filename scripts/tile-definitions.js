
var Constants = {
	START_TILE: 13,
};

var TileDescs = [
	{ x: 0, y: 0, count: 4, edges: [ 'F0',   'F0',   'F0',   'F0' ], cloister:  1, pennant: false, zones: [{x:72, y:72}, {x:45, y:45}] },
	{ x: 1, y: 0, count: 2, edges: [ 'F0',   'F0',   'P020', 'F0' ], cloister:  1, pennant: false, zones: [{x:72, y:22}, {x:45, y:45}, {x:43, y:72}] },
	{ x: 2, y: 0, count: 3, edges: [ 'T0',   'P123', 'P321', 'T0' ], cloister: -1, pennant: false, zones: [{x:22, y:22}, {x:50, y:50}, {x:63,y:63}, {x:75, y:75}] },
	{ x: 3, y: 0, count: 3, edges: [ 'T0',   'F1',   'F1',   'T0' ], cloister: -1, pennant: false, zones: [{x:22, y:22}, {x:60, y:60}] },
	{ x: 4, y: 0, count: 3, edges: [ 'T0',   'T0',   'F1',   'T0' ], cloister: -1, pennant: false, zones: [{x:45, y:33}, {x:45, y:72}] },
	{ x: 5, y: 0, count: 1, edges: [ 'T0',   'T0',   'P321', 'T0' ], cloister: -1, pennant: false, zones: [{x:45, y:33}, {x:22, y:72}, {x:45, y:72}, {x:67, y:72}] },

	{ x: 0, y: 1, count: 8, edges: [ 'P012', 'F2',   'P210', 'F0' ], cloister: -1, pennant: false, zones: [{x:21, y:45}, {x:50, y:45}, {x:72, y:45}] },
	{ x: 1, y: 1, count: 1, edges: [ 'T0',   'T0',   'T0',   'T0' ], cloister: -1, pennant: true, zones: [{x:45, y:45}] },
	{ x: 2, y: 1, count: 2, edges: [ 'T0',   'P123', 'P321', 'T0' ], cloister: -1, pennant: true, zones: [{x:22, y:22}, {x:50, y:50}, {x:63,y:63}, {x:75, y:75}] },
	{ x: 3, y: 1, count: 2, edges: [ 'T0',   'F1',   'F1',   'T0' ], cloister: -1, pennant: true, zones: [{x:22, y:22}, {x:60, y:60}] },
	{ x: 4, y: 1, count: 1, edges: [ 'T0',   'T0',   'F1',   'T0' ], cloister: -1, pennant: true, zones: [{x:45, y:33}, {x:45, y:72}] },
	{ x: 5, y: 1, count: 2, edges: [ 'T0',   'T0',   'P321', 'T0' ], cloister: -1, pennant: true, zones: [{x:45, y:33}, {x:22, y:72}, {x:45, y:72}, {x:67, y:72}] },

	{ x: 0, y: 2, count: 9, edges: [ 'F0',   'F0',   'P012', 'P210' ], cloister: -1, pennant: false, zones: [{x:67, y:31}, {x:45, y:45}, {x:22, y:67}] },
	{ x: 1, y: 2, count: 3, edges: [ 'T1',   'P230', 'F0',   'P032' ], cloister: -1, pennant: false, zones: [{x:45, y:67}, {x:45, y:12}, {x:15, y:31}, {x:45, y:42}] },
	{ x: 2, y: 2, count: 3, edges: [ 'T0',   'P156', 'P643', 'P321' ], cloister: -1, pennant: false, zones: [{x:45, y:12}, {x:50, y:40}, {x:19, y:48}, {x:19, y:72}, {x:42, y:75}, {x:75, y:56}, {x:74, y:75} ] },
	{ x: 3, y: 2, count: 5, edges: [ 'T1',   'F0',   'F0',   'F0' ], cloister: -1, pennant: false, zones: [{x:45, y:50}, {x:45, y:12}] },
	{ x: 4, y: 2, count: 2, edges: [ 'T2',   'F0',   'F0',   'T1' ], cloister: -1, pennant: false, zones: [{x:50, y:50}, {x:10, y:45}, {x:45, y:12}] },
	{ x: 5, y: 2, count: 1, edges: [ 'F1',   'T0',   'F2',   'T0' ], cloister: -1, pennant: false, zones: [{x:45, y:40}, {x:45, y:5}, {x:61, y:75}] },

	{ x: 0, y: 3, count: 1, edges: [ 'P015', 'P567', 'P743', 'P320' ], cloister: -1, pennant: false, zones: [{x:19, y:19}, {x:45, y:18}, {x:14, y:43}, {x:14, y:72}, {x:40, y:75}, {x:72, y:24}, {x:76, y:50}, {x:68, y:75}] },
	{ x: 1, y: 3, count: 4, edges: [ 'F0',   'P045', 'P532', 'P210' ], cloister: -1, pennant: false, zones: [{x:50, y:17}, {x:14, y:43}, {x:20, y:67}, {x:43, y:72}, {x:76, y:42}, {x:71, y:71} ] },
	{ x: 2, y: 3, count: 3, edges: [ 'T1',   'P023', 'P320', 'F0' ], cloister: -1, pennant: false, zones: [{x:30, y:50}, {x:45, y:12}, {x:53, y:62}, {x:72, y:72}] },
	{ x: 3, y: 3, count: 3, edges: [ 'T1',   'F0',   'P023', 'P320' ], cloister: -1, pennant: false, zones: [{x:68, y:50}, {x:45, y:12}, {x:38, y:63}, {x:22, y:72}] },
	{ x: 4, y: 3, count: 3, edges: [ 'T1',   'F0',   'T2',   'F0' ], cloister: -1, pennant: false, zones: [{x:45, y:45}, {x:45, y:14}, {x:45, y:75}] },
	{ x: 5, y: 3, count: 2, edges: [ 'F1',   'T0',   'F2',   'T0' ], cloister: -1, pennant: true, zones: [{x:45, y:40}, {x:45, y:5}, {x:61, y:75}] },
];
