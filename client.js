var PORT = 1337;
var util = require('util');
function pp(x) {
  console.log(util.inspect(x, {depth: null}));
}

nslookup = require('nslookup');

nslookup('shawnpresser.com')
  .server('8.8.8.8') // default is 8.8.8.8 
  .type('A') // default is 'a' 
  .timeout(10 * 1000) // default is 3 * 1000 ms 
  .end(function (err, addrs) {
    console.log(addrs);
    main(addrs[0]);
  });

function main(HOST) {
  var dgram = require('dgram');
  var id = Math.floor(Math.random()*Math.pow(2,64)).toString(16)

  var client = dgram.createSocket('udp4');
  let addr;

  client.on('message', function (data, remote) {
    var pkt = JSON.parse(data);
    console.log('message');
    pp({pkt, remote})
  });

  
  client.bind(0,
    function() {
      console.log('addr: ' + JSON.stringify(client.address()));
      addr = client.address();
      console.log('listening ' + JSON.stringify(addr));
      setTimeout(tick, 400);
    });

  function tick() {
    var pkt = JSON.stringify({id,
      port: addr.port,
      message: 'My KungFu is Good!',
      props: {pos: [Math.random(), Math.random(), Math.random()]}
    });

    client.send(pkt, PORT, HOST, function(err, bytes) {
      if (err) throw err;
      //console.log('UDP message sent to ' + HOST +':'+ PORT);
      pp(pkt, {depth: null});
     client.close();

    });
    setTimeout(tick, 400);
  }
}
