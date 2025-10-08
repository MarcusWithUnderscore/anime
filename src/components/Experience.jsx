import { useTexture, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";

export const Experience = () => {
  const texture = useTexture("textures/bg5.jpeg");
  const { scene, viewport, camera } = useThree();
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  
  useEffect(() => {
    if (texture) {
      // Improve texture quality
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // Calculate aspect ratios to prevent stretching
      const imageAspect = texture.image.width / texture.image.height;
      const viewportAspect = viewport.aspect;
      
      // Adjust texture to cover without stretching
      if (viewportAspect > imageAspect) {
        // Viewport is wider than image
        texture.repeat.set(1, imageAspect / viewportAspect);
        texture.offset.set(0, (1 - imageAspect / viewportAspect) / 2);
      } else {
        // Viewport is taller than image
        texture.repeat.set(viewportAspect / imageAspect, 1);
        texture.offset.set((1 - viewportAspect / imageAspect) / 2, 0);
      }
      
      scene.background = texture;
    }
    return () => {
      scene.background = null;
    };
  }, [texture, scene, viewport]);
  
  return (
    <>
      <OrbitControls />
      
      <group position-y={-1}>
         <Avatar animation={currentAnimation} />
      </group>
      
      <ambientLight intensity={0.8}/>
      
      {/* Optional: UI to switch animations - uncomment when you add more animations
      <Html fullscreen>
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
          <button onClick={() => setCurrentAnimation("excited")}>Excited</button>
          <button onClick={() => setCurrentAnimation("idle")}>Idle</button>
          <button onClick={() => setCurrentAnimation("wave")}>Wave</button>
        </div>
      </Html>
      */}
    </>
  );
};