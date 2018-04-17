#!/usr/bin/env node

const TICKRATE = 1000/parseInt(process.env.TICKRATE || '40');
const HOST = process.env.HOST || '0.0.0.0'
const PORT = parseInt(process.argv[2] ? process.argv[2] : '1337');

let players = {}

var util = require('util');
function pp(x) {
  console.log(util.inspect(x, {depth: null}));
}

let VERBOSE = process.env.VERBOSE;
if (VERBOSE) {
  console.dir({argv: process.argv});
}

function player(id) {
  if (players[id]) return players[id];
  console.log(`Player ${id} connected.`)
  var player = {
    props: {}
  }
  players[id] = player;
  return player;
}

function addr({address, port}) {
  return address + ':' + port
}
function remote(addr) {
  const [address, port] = addr.split(':');
  return {address, port}
}

let dgram = require('dgram');
let server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', function (data, remote) {
  pkt = JSON.parse(data);
  var id = addr(remote);
  if (VERBOSE && VERBOSE.length >= 2) {
    pp(['message', {id, pkt}])
  }
  var p = player(id);
  if (pkt.props) {
    for (var prop in pkt.props) {
      p.props[prop] = pkt.props[prop];
    }
  }
});


server.on('close', function() {
  console.log('close');
});

prev = Date.now();

function relay() {
  if (Date.now() - prev > 1000) {
    prev = Date.now();
    pp({players})
  }
  var pkt = JSON.stringify(players);
  for (var id in players) {
    var p = players[id];
    var {address, port} = remote(id);
    if (VERBOSE && VERBOSE.length >= 3) {
      pp(['sent', {address, port, size: pkt.length}]);
    }
    server.send(pkt, port, address,
      function (err, bytes) {
        if (err) {
          console.warn({id, err});
        }
      })
  }
  setTimeout(relay, TICKRATE);
}

server.bind(PORT, HOST, () => {
  var address = server.address();
  console.log('UDP Server listening');
  console.log('Local IP: ' + address.address + ":" + address.port);
  relay();
  require('./ip')((err, ip) => {
    console.log('Public IP: ' + ip + ":" + PORT);
  })
});
