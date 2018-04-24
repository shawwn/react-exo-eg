const RATE = 1000/60;
import React from "react";
import { render } from "react-dom";
const VERBOSE = process.env.VERBOSE;

function getCameraPosition() {
  var scene = document.querySelector('a-scene');
  if (scene && scene.camera) {
    return scene.camera.el.getAttribute('position');
  } else {
    return {x: 0, y: 0, z: 0}
  }
}

//var util = require('util');
window.pp = function pp(x) {
  //console.log(util.inspect(x, {depth: null}));
  //console.dir(x);
}

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center"
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      position: '',
      rotation: '',
      color: '#333333',
      players: {}
    };

    const _getGamepad = () => navigator.getGamepads().find(gamepad => gamepad);

    let lastTrigger = false;
    const animate = () => {
      const gamepad = _getGamepad();
      let trigger = false;
      if (gamepad) {
        const p = new THREE.Vector3()
          .fromArray(gamepad.pose.position);
        const e = new THREE.Euler()
          .setFromQuaternion(new THREE.Quaternion().fromArray(gamepad.pose.orientation), 'YXZ');

        trigger = gamepad.buttons[1].pressed;

        const o = {
          position: p.toArray().join(' '),
          rotation: e.toArray().slice(0, 3).map(d => d * 180 / Math.PI).join(' '), // XXX this computation is wrongly Eulerized
        };
        if (trigger && !lastTrigger) {
          o.color = '#' + new THREE.Color(Math.floor(Math.random() * 0xFFFFFFFF)).getHexString();
        }
        this.setState(o);
      };
      lastTrigger = trigger;


      window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);


    if (navigator.userAgent !== 'Exokit') return;

    this.HOST = process.env.HOST || window.location.hostname;
    this.PORT = process.env.PORT ? parseInt(process.env.PORT) : parseInt(window.location.port || '80');

    if (typeof dgram !== 'undefined') {
      this.client = dgram.createSocket('udp4');
      this.clientID = Math.floor(Math.random()*Math.pow(2,64)).toString(16)

      console.log('Connecting to ' + this.HOST + ':' + this.PORT);

      this.client.on('message', (data, remote) => {
        var pkt = JSON.parse(data);
        this.setState({players: pkt},
          () => {
            if (VERBOSE) {
              console.dir({players: this.state.players});
              window.pp({type: 'recv', pkt, remote})
            }
            this.forceUpdate();
          });
      });

      this.client.bind(0, () => {
        let prev = Date.now();
        let tick = () => {
          if (Date.now() - prev > 1000) {
            Object.entries(this.state.players).forEach(([id, player]) => {
              console.dir({id, player});
            });
            prev = Date.now();
          }
          var pos = getCameraPosition();
          var pkt = JSON.stringify({
            id: this.clientID,
            message: 'My KungFu is Good!',
            props: {pos: [pos.x, pos.y, pos.z]}
          });

          this.client.send(pkt, this.PORT, this.HOST, (err, bytes) => {
            if (err) throw err;
            //console.log('UDP message sent to ' + this.HOST +':'+ this.PORT);
          });
          setTimeout(tick, RATE);
        }
        setTimeout(tick, RATE);
      });
    }
  }

  render() {
    return (<a-scene stats ref={(el) => { window.scene = this.scene = el; }}>
      {
        //console.log('render ' + Object.keys(this.state.players).length),
        
        Object.entries(this.state.players).map(function([id, p]) {
        //var pos = "-1 0.5 -3"
        var pos = p.props.pos.join(' ');
        var box = (<a-box key={'boxes-'+id} position={pos} rotation="0 45 0" color="#4CC3D9" shadow />);
        //console.log('BOX ' + id + ' ' + pos);
        return box;
      })}
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" shadow />
      <a-box position={this.state.position} rotation={this.state.rotation} depth="0.1" height="0.1" width="0.1" color={this.state.color} />
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E" shadow />
      <a-cylinder
        position="1 0.75 -3"
        radius="0.5"
        height="1.5"
        color="#FF00FF"
        shadow
      />
      <a-plane
        position="0 0 -4"
        rotation="-90 0 0"
        width="4"
        height="4"
        color="#7BC8A4"
        shadow
      />
      <a-sky color="#ECECEC" />
    </a-scene>);
  }

  tick() {
  }
}

render(<App />, document.getElementById("root"));

