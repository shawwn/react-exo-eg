import React from "react";
import { render } from "react-dom";

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
    };

    const animate = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads.find(gamepad => gamepad);
      if (gamepad) {
        const p = new THREE.Vector3()
          .fromArray(gamepad.pose.position);
        const e = new THREE.Euler()
          .setFromQuaternion(new THREE.Quaternion().fromArray(gamepad.pose.orientation));
        this.setState({
          position: p.toArray().join(' '),
          rotation: e.toArray().slice(0, 3).map(d => d * 180 / Math.PI).join(' '), // XXX this computation is wrongly Eulerized
        });
      };

      window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);
  }

  render() {
    return <a-scene stats>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" shadow />
      <a-box position={this.state.position} rotation={this.state.rotation} depth="0.1" height="0.1" width="0.1" color="#333333" />
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
    </a-scene>;
  }
}

render(<App />, document.getElementById("root"));
