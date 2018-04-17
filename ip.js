module.exports = function(cb) {
  var options = {
    host: 'api.ipify.io',
    port: 80,
    path: '/'
  };

  require('http').get(options, function(res) {
    res.on("data", function(chunk) {
      cb(null, chunk.toString());
    });
  }).on('error', function(e) {
    cb(e);
    console.warn("Couldn't fetch IP: " + e.message);
  });
}
