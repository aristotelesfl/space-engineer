// Tiro.jsx
import React, { FC } from 'react';
import type ShipPosition  from '../../types/ShipPositionInterface';
import './index.css';

interface LaserProps {
  inicialPosition: ShipPosition;
}

const Laser: FC<LaserProps> = ({ inicialPosition }) => {
  const bulletStyle = {
    left: `${inicialPosition.x}px`,
    bottom: `${inicialPosition.y}px`,
  };

  return (
    <div className="laser-container" style={{
      position: 'absolute',
      bottom: '100px',
      animation: 'move-laser 1s linear infinite',
      }}>
      <div className="laser-sprite"
      style={{ 
        minWidth: '11px',
        minHeight: '21px',
        backgroundImage: 'url(./assets/Laser.png) contain no-repeat-x',
        imageRendering: 'pixelated',
       }}></div>
    </div>
  );
};

export default Laser;