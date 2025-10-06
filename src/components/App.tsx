import React from 'react';
import './App.css';
import Background from './background';
import MotherShip from './mother-ship';
import Laser from './laser';

function App() {
  return (
    <div className="App">
      <main className="App-main">
        <MotherShip />
        <Laser inicialPosition={{ x: 100, y: 100 }} />
          <Background />
      </main>
    </div>
  );
}

export default App;
