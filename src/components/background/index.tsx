import React from "react";
import './index.css';

const Background = () => {
  return (
    <div id="background"
  style={{
    width: '100%',
    maxWidth: '720px',
    minHeight: '100vh',
    background: 'url(./PixelBackgroundSeamlessVertically.png) top center / 100% 400px repeat-y',
    imageRendering: 'pixelated',
    animation: 'background-scroll 10s linear infinite',
  }}
    />
  );
};

export default Background;
