import { Environment } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useState, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Camera Controller Component
function DynamicCameraController({ isPlaying, zoomLevel }) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  const currentSceneRef = useRef(0);
  const transitionRef = useRef(0);
  const isTransitioningRef = useRef(false);
/*

perfect angles:
 { pos: [0, 0.3, 11], look: [0, 0.1,0.3], duration: 0.1 },
*/
  const scenes = [
  // { pos: [0, 0.1, 2], look: [0, 0.1,0.3], duration: 0.1 },
   /**/

    { pos: [0, 0.3, 11], look: [0, 0.1,0.3], duration: 0.1 },
   { pos: [0, 0.3, 10], look: [0, 0.1,0.3], duration: 0.1 },
   { pos: [0, 0.3, 9], look: [0, 0.1,0.3], duration: 0.1 },
    { pos: [0, 0.3, 8], look: [0, 0.1,0.3], duration: 0.1 },
   { pos: [0, 0.3, 7], look: [0, 0.1,0.3], duration: 0.1 },
    { pos: [0, 0.3, 6], look: [0, 0.1,0.3], duration: 0.1 },
     { pos: [0, 0.3, 5], look: [0, 0.1,0.3], duration: 0.1 },
      { pos: [0, 0.3, 4], look: [0, 0.1,0.3], duration: 0.1 },
       { pos: [0, 0.3,3], look: [0, 0.1,0.3], duration: 0.1 },
       { pos: [0, 0.3, 3], look: [0, 0.3,0.3], duration: 0.1 },
   { pos: [0, 0.5, 2], look: [0, 0.5,0.3], duration: 1 },
   { pos: [0, 0.7, 2], look: [0, 0.7,0.3], duration: 1 },
   { pos: [0, 0.9, 2], look: [0, 0.9,0.3], duration: 1 },
   { pos: [0, 1.1, 2], look: [0, 1.1,0.3], duration: 1 },
   { pos: [0, 1.2, 2], look: [0, 1.2,0.3], duration: 1 },
   { pos: [-0.1, 1.5, 3], look: [0, 1.4,0.3], duration: 1 },
   { pos: [-0.3, 1.7, 3], look: [0, 1.4,0.3], duration: 1}
   
  
   
   
   
   
   
 
  ];

  const startPos = useRef(new THREE.Vector3());
  const startLook = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta;
    const currentScene = scenes[currentSceneRef.current];
    const zoomFactor = zoomLevel / 5;
    
    if (!isTransitioningRef.current) {
      if (timeRef.current >= currentScene.duration) {
        isTransitioningRef.current = true;
        transitionRef.current = 0;
        
        startPos.current.copy(camera.position);
        startLook.current.copy(
          new THREE.Vector3(currentScene.look[0], currentScene.look[1], currentScene.look[2])
        );

        currentSceneRef.current = (currentSceneRef.current + 1) % scenes.length;
        const nextScene = scenes[currentSceneRef.current];
        
        targetPos.current.set(
          nextScene.pos[0] * zoomFactor,
          nextScene.pos[1],
          nextScene.pos[2] * zoomFactor
        );
        targetLook.current.set(nextScene.look[0], nextScene.look[1], nextScene.look[2]);
        
        timeRef.current = 0;
      }
    } else {
      transitionRef.current += delta;
      const progress = Math.min(transitionRef.current / 2, 1);
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPos.current, targetPos.current, eased);
      const currentLook = new THREE.Vector3().lerpVectors(startLook.current, targetLook.current, eased);
      camera.lookAt(currentLook);

      if (progress >= 1) {
        isTransitioningRef.current = false;
      }
    }

    const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    camera.position.y += floatY * delta;
  });

  return null;
}

export const Experience = () => {
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  const [isPlaying] = useState(true);
  const [zoomLevel] = useState(5);
  
  return (
    <>
      <DynamicCameraController isPlaying={isPlaying} zoomLevel={zoomLevel} />
      
      <Environment preset="city" />
      
      <ambientLight intensity={0.3}/>
      
      <spotLight 
        position={[0, 8, 2]} 
        angle={0.6}
        penumbra={0.5}
        intensity={2}
        color="#ff1493"
        castShadow
      />
      
      <spotLight 
        position={[-3, 6, 0]} 
        angle={0.5}
        penumbra={0.8}
        intensity={1.5}
        color="#4169e1"
      />
      <spotLight 
        position={[3, 6, 0]} 
        angle={0.5}
        penumbra={0.8}
        intensity={1.5}
        color="#9370db"
      />
      
      <pointLight position={[0, 4, -4]} intensity={1} color="#ff6b9d" />
      
      <ConcertRoom />
      
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 5.5]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      <group position={[0, 0.1, 0]}>
        <Avatar animation={currentAnimation} />
      </group>
      
      <Microphone position={[0, 0.1, 0.5]} />
      
      <mesh position={[0, 3, -2.8]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#8b0000" 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[-4, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[4, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
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
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
};

const Microphone = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
      </mesh>
    </group>
  );
};

const Speaker = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.5, 0.6]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0, 0.3, 0.31]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.3, 0.31]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
    </group>
  );
};

const StageLight = ({ position = [0, 0, 0], color = "#ffffff" }) => {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.4, 8]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
};