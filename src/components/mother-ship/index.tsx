import React from "react";

import './index.css';

const MotherShip = () => {
  return (
    <div id="mother-ship"
        style={{
            width: '64px',
            height: '64px',
            background: 'url(./assets/Player.png) center / contain no-repeat',
            position: 'absolute',
            bottom: '50px',
        }}
    />
  );
}

export default MotherShip;
