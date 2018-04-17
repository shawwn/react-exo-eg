RATE = 1000/60;

var util = require('util');
function pp(x) {
  console.log(util.inspect(x, {depth: null}));
}

nslookup = require('nslookup');
ip = null;

nslookup('shawnpresser.com')
  .server('8.8.8.8') // default is 8.8.8.8 
  .type('A') // default is 'a' 
  .timeout(10 * 1000) // default is 3 * 1000 ms 
  .end(function (err, addrs) {
    console.log(addrs); // => ['66.6.44.4'] 
    ip = addrs[0];
    //main(addrs[0]);
    main('0.0.0.0');
  });

function main(HOST) {
var PORT = 1337;
  /*
var HOST = '192.168.1.147';
*/

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

nextID = 1;
players = {}


function player(id) {
  if (players[id]) return players[id];
  var player = {
    props: {}
  }
  players[id] = player;
  return player;
}

server.on('message', function (data, remote) {
  pkt = JSON.parse(data);
  var id = pkt.id;
  //console.log(remote);
  var p = player(id);
  p.remote = remote;
  if (pkt.props) {
    for (var prop in pkt.props) {
      p.props[prop] = pkt.props[prop];
    }
  }
  //console.dir(pkt);
  //pp(players);
});

function relay() {
  var pkt = JSON.stringify(players);
  var i = 0;
  for (var id in players) {
    i++
    var p = players[id];
    //console.log(pkt + '\nsent to ' + p.remote.address + ':' + p.remote.port);
    server.send(pkt, p.remote.port, p.remote.address,
      function (err, bytes) {
        if (err) console.warn({id, err});
      })
  }
  //console.log(i);
  setTimeout(relay, RATE);
}
setTimeout(relay, RATE);

server.bind(PORT, HOST);
};
