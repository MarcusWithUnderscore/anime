


















import React, { useState } from 'react';

export const CameraControls = ({ onSpeedChange, onCameraStyleChange, onCameraChange }) => {
  const [speed, setSpeed] = useState(1.5);
  const [selectedStyle, setSelectedStyle] = useState('custom');
  const [currentCamera, setCurrentCamera] = useState(0);

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
    onCameraStyleChange(style);
  };

  const handlePrevCamera = () => {
    const newCamera = currentCamera - 1;
    setCurrentCamera(newCamera);
    if (onCameraChange) onCameraChange(newCamera);
  };

  const handleNextCamera = () => {
    const newCamera = currentCamera + 1;
    setCurrentCamera(newCamera);
    if (onCameraChange) onCameraChange(newCamera);
  };

  return (
    <>
      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      
      <div style={styles.container}>
        <div style={styles.panel}>
          {/* Camera Styles */}
          <div style={styles.section}>
            <h3 style={styles.title}>Camera Style</h3>
            <div style={styles.buttonGrid}>
              <button
                style={{
                  ...styles.button,
                  ...(selectedStyle === 'custom' ? styles.buttonActive : {})
                }}
                onClick={() => handleStyleChange('custom')}
              >
                🎬 Custom
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(selectedStyle === 'cinematic' ? styles.buttonActive : {})
                }}
                onClick={() => handleStyleChange('cinematic')}
              >
                🎥 Cinematic
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(selectedStyle === 'concert' ? styles.buttonActive : {})
                }}
                onClick={() => handleStyleChange('concert')}
              >
                🎤 Concert
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(selectedStyle === 'drone' ? styles.buttonActive : {})
                }}
                onClick={() => handleStyleChange('drone')}
              >
                🚁 Drone
              </button>
            </div>
          </div>

          {/* Speed Controls */}
          <div style={styles.section}>
            <h3 style={styles.title}>Camera Speed</h3>
            <div style={styles.buttonGrid}>
              <button
                style={{
                  ...styles.button,
                  ...(speed === 0.5 ? styles.buttonActive : {})
                }}
                onClick={() => handleSpeedChange(0.5)}
              >
                🐌 Slow
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(speed === 1.5 ? styles.buttonActive : {})
                }}
                onClick={() => handleSpeedChange(1.5)}
              >
                ▶️ Normal
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(speed === 3 ? styles.buttonActive : {})
                }}
                onClick={() => handleSpeedChange(3)}
              >
                ⚡ Fast
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(speed === 5 ? styles.buttonActive : {})
                }}
                onClick={() => handleSpeedChange(5)}
              >
                🚀 Very Fast
              </button>
            </div>
          </div>

          {/* Arrow Navigation */}
          <div style={styles.section}>
            <h3 style={styles.title}>Camera Navigation</h3>
            <div style={styles.arrowControls}>
              <button
                style={styles.arrowButton}
                onClick={handlePrevCamera}
              >
                <i className="fas fa-arrow-left" style={styles.icon}></i>
                Previous
              </button>
              <div style={styles.cameraIndicator}>
                Camera {currentCamera + 1}
              </div>
              <button
                style={styles.arrowButton}
                onClick={handleNextCamera}
              >
                Next
                <i className="fas fa-arrow-right" style={styles.icon}></i>
              </button>
            </div>
          </div>

          {/* Speed Slider */}
          <div style={styles.section}>
            <h3 style={styles.title}>Fine Tune Speed: {speed.toFixed(1)}x</h3>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    fontFamily: 'Arial, sans-serif',
  },
  panel: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '500px',
  },
  section: {
    marginBottom: '15px',
  },
  title: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  buttonActive: {
    backgroundColor: '#ff1493',
    borderColor: '#ff1493',
    boxShadow: '0 4px 12px rgba(255, 20, 147, 0.4)',
  },
  arrowControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
  },
  arrowButton: {
    backgroundColor: '#ff1493',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(255, 20, 147, 0.4)',
  },
  cameraIndicator: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '14px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    minWidth: '120px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '16px',
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    outline: 'none',
    background: 'linear-gradient(to right, #00bfff, #ff1493)',
    cursor: 'pointer',
  },
};

// Add hover effects via CSS-in-JS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    button:hover {
      transform: translateY(-2px);
      background-color: rgba(255, 255, 255, 0.2) !important;
    }
    button:active {
      transform: translateY(0);
    }
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ff1493;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(255, 20, 147, 0.5);
    }
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ff1493;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(255, 20, 147, 0.5);
    }
  `;
  document.head.appendChild(style);
}





