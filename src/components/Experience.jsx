import { Environment } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useState, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Camera Controller Component
function DynamicCameraController({ isPlaying, zoomLevel, globalSpeed = 1.5 }) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const isPausedRef = useRef(false);
  const pauseTimerRef = useRef(0);
  const lastCheckedPointRef = useRef(-1);

  // Camera path points - add pause (in seconds) to pause at that point
  const pathPoints = [
     { pos: [0, 0.1 , 1], look: [0, 0.1, 0.3] },
     { pos: [0, 1, 2], look: [0, 1, 0.3] },
     { pos: [0, 1.3, 5], look: [0, 1.3, 0.3] },
     
    { pos: [0, 0.3, 15], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 14], look: [0, 0.1, 0.3]  },
    { pos: [0, 0.3, 13], look: [0, 0.1, 0.3]  },
    { pos: [0, 0.3, 12], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 11], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 10], look: [0, 0.1, 0.3]  },
    { pos: [0, 0.3, 9], look: [0, 0.1, 0.3]  },
    { pos: [0, 0.3, 8], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 7], look: [0, 0.1, 0.3]  }, 
    { pos: [0, 0.3, 6], look: [0, 0.3, 0.3]  },
    { pos: [0, 0.9, 5], look: [0, 0.9, 0.3] , pause: 5 },
    { pos: [0, 1.1, 2], look: [0, 1.1, 0.3], pause: 5  },
    { pos: [0, 5, 5,], look: [0, 1.1, 0.3], pause: 5 },
    { pos: [0, 5, 2], look: [0, 1.1, 0.3] },
     { pos: [0, 5, 14], look: [0, 1.1, 0.3] },
     { pos: [0, 2, 2], look: [0,0, 0.3], pause: 5 },
     { pos: [0, 2.5 , 1.5], look: [0, 1.5, 0.3], pause: 8 },
      { pos: [0, 5 , 10], look: [0, 1.5, 0.3] , pause: 8},
     

       { pos: [0, 0.1 , 1], look: [0, 0.1, 0.3] },
     { pos: [0, 1, 2], look: [0, 1, 0.3] },
     { pos: [0, 1.3, 5], look: [0, 1.3, 0.3] },
     
    { pos: [0, 0.3, 15], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 14], look: [0, 0.1, 0.3]  },
    { pos: [0, 0.3, 13], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 12], look: [0, 0.1, 0.3]  },
    { pos: [0, 0.3, 11], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 10], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 9], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 8], look: [0, 0.1, 0.3] },
    { pos: [0, 0.3, 7], look: [0, 0.1, 0.3] }, // Pause 2 seconds here
    { pos: [0, 0.3, 6], look: [0, 0.3, 0.3] },
    { pos: [0, 0.9, 5], look: [0, 0.9, 0.3] },
    { pos: [0, 1.1, 2], look: [0, 1.1, 0.3] },
    { pos: [0, 5, 5,], look: [0, 1.1, 0.3]},
    { pos: [0, 5, 2], look: [0, 1.1, 0.3]},
     { pos: [0, 5, 14], look: [0, 1.1, 0.3] },
     { pos: [0, 2, 2], look: [0,0, 0.3]},
     { pos: [0, 2.5 , 1.5], look: [0, 1.5, 0.3] },
      { pos: [0, 5 , 10], look: [0, 1.5, 0.3] },
     
  ];

  // Create THREE.js curve from path points
  const positionCurve = useRef();
  const lookCurve = useRef();
  const pausePoints = useRef([]);

  if (!positionCurve.current) {
    const posPoints = pathPoints.map(p => 
      new THREE.Vector3(p.pos[0], p.pos[1], p.pos[2])
    );
    const lookPoints = pathPoints.map(p => 
      new THREE.Vector3(p.look[0], p.look[1], p.look[2])
    );
    
    positionCurve.current = new THREE.CatmullRomCurve3(posPoints, false, 'catmullrom', 0.5);
    lookCurve.current = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5);
    
    // Store pause information with their positions on the curve (0-1)
    pausePoints.current = pathPoints
      .map((point, index) => ({
        progress: index / (pathPoints.length - 1),
        duration: point.pause || 0,
        triggered: false
      }))
      .filter(p => p.duration > 0);
  }

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Handle active pause
    if (isPausedRef.current) {
      pauseTimerRef.current += delta;
      
      if (pauseTimerRef.current >= pausePoints.current[lastCheckedPointRef.current].duration) {
        // Pause finished
        isPausedRef.current = false;
        pauseTimerRef.current = 0;
        pausePoints.current[lastCheckedPointRef.current].triggered = false;
      } else {
        // Still paused - just apply subtle float
        const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        camera.position.y += floatY * delta * 0.3;
        return;
      }
    }

    // Continuous progress along the path (0 to 1)
    progressRef.current += delta * globalSpeed * 0.05;
    
    // Loop back to start
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      // Reset all pause triggers
      pausePoints.current.forEach(p => p.triggered = false);
      lastCheckedPointRef.current = -1;
    }

    // Check if we've reached a pause point
    for (let i = 0; i < pausePoints.current.length; i++) {
      const pausePoint = pausePoints.current[i];
      const threshold = 0.015; // How close to the point to trigger pause
      
      if (!pausePoint.triggered && 
          Math.abs(progressRef.current - pausePoint.progress) < threshold &&
          i !== lastCheckedPointRef.current) {
        // Trigger pause
        isPausedRef.current = true;
        pauseTimerRef.current = 0;
        lastCheckedPointRef.current = i;
        pausePoint.triggered = true;
        
        // Snap to exact pause position
        progressRef.current = pausePoint.progress;
        break;
      }
    }

    // Get position and look-at point from curves
    const position = positionCurve.current.getPoint(progressRef.current);
    const lookAt = lookCurve.current.getPoint(progressRef.current);

    // Apply zoom factor
    const zoomFactor = zoomLevel / 5;
    position.x *= zoomFactor;
    position.z *= zoomFactor;

    // Smooth interpolation to new position
    camera.position.lerp(position, 0.1);
    camera.lookAt(lookAt);

    // Subtle floating effect
    const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    camera.position.y += floatY * delta * 0.3;
  });

  return null;
}

export const Experience = () => {
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  const [isPlaying] = useState(true);
  const [zoomLevel] = useState(5);
  
  return (
    <>
      <DynamicCameraController 
        isPlaying={isPlaying} 
        zoomLevel={zoomLevel}
        globalSpeed={1.5} // Adjust: 0.5=slow, 1.5=normal, 3=fast
      />
      
      <Environment preset="city" />
      
      <ambientLight intensity={0.2}/>
      
      {/* Main stage spotlight - more dramatic */}
      <spotLight 
        position={[0, 8, 2]} 
        angle={0.5}
        penumbra={0.6}
        intensity={3}
        color="#ff1493"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Side colored lights */}
      <spotLight 
        position={[-3, 6, 0]} 
        angle={0.4}
        penumbra={0.7}
        intensity={2}
        color="#00bfff"
      />
      <spotLight 
        position={[3, 6, 0]} 
        angle={0.4}
        penumbra={0.7}
        intensity={2}
        color="#9370db"
      />
      
      {/* Back rim lights */}
      <spotLight 
        position={[-2, 4, -2]} 
        angle={0.3}
        penumbra={0.8}
        intensity={1.5}
        color="#ff6b9d"
      />
      <spotLight 
        position={[2, 4, -2]} 
        angle={0.3}
        penumbra={0.8}
        intensity={1.5}
        color="#00ffff"
      />
      
      {/* Front fill light */}
      <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" />
      
      {/* Atmospheric fog light */}
      <pointLight position={[0, 1, -3]} intensity={2} color="#8b00ff" distance={8} decay={2} />
      
      <ConcertRoom />
      
      {/* Enhanced stage floor with reflection */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Glossy stage surface */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 5.5]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>
      
      <group position={[0, 0.1, 0]}>
        <Avatar animation={currentAnimation} />
      </group>
      
      <Microphone position={[0, 0.1, 0.5]} micType="studio" />
      {/* For handheld mic during performance, change to: */}
      {/* <Microphone position={[0, 0.1, 0.5]} micType="handheld" /> */}
      
      {/* Stage backdrop with texture */}
      <mesh position={[0, 3, -2.8]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#1a0000" 
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* LED light strips on backdrop */}
      <mesh position={[0, 5.5, -2.79]}>
        <boxGeometry args={[9, 0.1, 0.05]} />
        <meshStandardMaterial 
          color="#ff1493"
          emissive="#ff1493"
          emissiveIntensity={3}
        />
      </mesh>
      <mesh position={[0, 0.5, -2.79]}>
        <boxGeometry args={[9, 0.1, 0.05]} />
        <meshStandardMaterial 
          color="#00bfff"
          emissive="#00bfff"
          emissiveIntensity={3}
        />
      </mesh>
      
      {/* Side walls with improved materials */}
      <mesh position={[-4, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial 
          color="#0a0000" 
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[4, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial 
          color="#0a0000" 
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
      
      <Speaker position={[-3.5, 0.1, -1]} />
      <Speaker position={[3.5, 0.1, -1]} />
      
      <StageLight position={[-2, 5, 1]} color="#ff1493" />
      <StageLight position={[2, 5, 1]} color="#4169e1" />
      <StageLight position={[0, 5, 2]} color="#9370db" />
      
      <mesh position={[0, -0.05, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#1a0a0a" />
      </mesh>
      
      {Array.from({ length: 4 }).map((_, row) => (
        <group key={row} position={[0, 0, 4 + row * 1.5]}>
          {Array.from({ length: 6 }).map((_, seat) => (
            <mesh 
              key={seat} 
              position={[(seat - 2.5) * 1.5, 0.3, 0]}
              castShadow
            >
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial color="#2a1a1a" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
};

const ConcertRoom = () => {
  return (
    <group>
      {/* Larger floor */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Back wall - extended */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Left wall - extended */}
      <mesh position={[-25, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Right wall - extended */}
      <mesh position={[25, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Ceiling - extended */}
      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      
      {/* Front wall (behind audience) */}
      <mesh position={[0, 5, 15]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Microphone = ({ position = [0, 0, 0], micType = "studio" }) => {
  if (micType === "handheld") {
    // Portable handheld concert microphone
    return (
      <group position={[...position, position[1] + 1.4, position[2] + 0.2]} rotation={[Math.PI / 6, 0, 0]}>
        {/* Mic body */}
        <mesh>
          <cylinderGeometry args={[0.022, 0.025, 0.18, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.9} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Grille head */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.7} 
            roughness={0.5}
          />
        </mesh>
        
        {/* Grille mesh pattern */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.036, 12, 12]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            metalness={0.6} 
            roughness={0.6}
            wireframe={true}
          />
        </mesh>
        
        {/* Handle grip texture */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.023, 0.023, 0.08, 16]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.3} 
            roughness={0.8}
          />
        </mesh>
        
        {/* XLR connector */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 0.03, 16]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  }
  
  // Studio condenser microphone (default)
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Main stand pole */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Boom arm joint */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Boom arm extending toward avatar */}
      <mesh position={[0, 1.3, -0.15]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Shock mount frame */}
      <group position={[0, 1.45, -0.32]} rotation={[Math.PI / 6, 0, 0]}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[0.055, 0.008, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
        </mesh>
        
        {/* Inner suspension ring */}
        <mesh>
          <torusGeometry args={[0.04, 0.006, 8, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.5} />
        </mesh>
        
        {/* Studio condenser mic body - cylindrical */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.95} 
            roughness={0.1}
          />
        </mesh>
        
        {/* Mic capsule (top grille) */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.03, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            metalness={0.8} 
            roughness={0.4}
          />
        </mesh>
        
        {/* Gold diaphragm detail */}
        <mesh position={[0, 0.095, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.002, 16]} />
          <meshStandardMaterial 
            color="#FFD700"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        
        {/* Bottom cap */}
        <mesh position={[0, -0.095, 0]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.9} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Brand ring detail */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.027, 0.027, 0.015, 16]} />
          <meshStandardMaterial 
            color="#8b0000"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* XLR connector at bottom */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.015, 0.018, 0.025, 8]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
      </group>
      
      {/* Pop filter */}
      <group position={[0, 1.45, -0.42]} rotation={[Math.PI / 6, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.08, 0.005, 8, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.001, 32]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            metalness={0.3}
            roughness={0.7}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};

const Speaker = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Main speaker box - taller, more realistic */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 2, 0.5]} />
        <meshStandardMaterial 
          color="#0a0a0a"
          roughness={0.9}
        />
      </mesh>
      
      {/* Large woofer */}
      <mesh position={[0, 0.4, 0.26]}>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      
      {/* Woofer cone */}
      <mesh position={[0, 0.4, 0.27]}>
        <cylinderGeometry args={[0.15, 0.22, 0.05, 32]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.8}
        />
      </mesh>
      
      {/* Mid speaker */}
      <mesh position={[0, -0.3, 0.26]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 32]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      
      {/* Tweeter */}
      <mesh position={[0, -0.7, 0.26]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* LED indicator */}
      <mesh position={[0, 0.9, 0.26]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial 
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
};

const StageLight = ({ position = [0, 0, 0], color = "#ffffff" }) => {
  return (
    <group position={position}>
      {/* Light housing */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 8]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      
      {/* Light beam source */}
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={5}
        />
      </mesh>
      
      {/* Mounting bracket */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.15, 0.08]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};