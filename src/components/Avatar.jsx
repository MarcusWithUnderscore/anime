





import React, { useEffect, useRef } from 'react'
import { useGraph } from '@react-three/fiber'
import { useFBX, useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

// Animation configuration - add more animations here when you have the files
const ANIMATIONS = {
  excited: "animations/Excited.fbx",
  idle: "animations/Idle.fbx",
  // Uncomment these when you have the files:
  // wave: "animations/Wave.fbx",
  // dance: "animations/Dance.fbx",
  // walk: "animations/Walk.fbx",
  // run: "animations/Run.fbx",
  // jump: "animations/Jump.fbx",
  // sit: "animations/Sit.fbx",
}

export function Avatar({ animation = "idle", ...props }) {
  const group = useRef()
  const { scene } = useGLTF('models/68e4b8a83448aa53be996b56.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  
  // Load animations you have
  const excitedAnim = useFBX(ANIMATIONS.excited)
  const idleAnim = useFBX(ANIMATIONS.idle)
  // Uncomment these when you add more animations:
  // const waveAnim = useFBX(ANIMATIONS.wave)
  // const danceAnim = useFBX(ANIMATIONS.dance)
  // const walkAnim = useFBX(ANIMATIONS.walk)
  // const runAnim = useFBX(ANIMATIONS.run)
  // const jumpAnim = useFBX(ANIMATIONS.jump)
  // const sitAnim = useFBX(ANIMATIONS.sit)
  
  // Prepare animations array
  const animations = React.useMemo(() => {
    excitedAnim.animations[0].name = "excited"
    idleAnim.animations[0].name = "idle"
    // Uncomment these when you add more animations:
    // waveAnim.animations[0].name = "wave"
    // danceAnim.animations[0].name = "dance"
    // walkAnim.animations[0].name = "walk"
    // runAnim.animations[0].name = "run"
    // jumpAnim.animations[0].name = "jump"
    // sitAnim.animations[0].name = "sit"
    
    return [
      ...excitedAnim.animations,
      ...idleAnim.animations,
      // Uncomment these when you add more animations:
      // ...waveAnim.animations,
      // ...danceAnim.animations,
      // ...walkAnim.animations,
      // ...runAnim.animations,
      // ...jumpAnim.animations,
      // ...sitAnim.animations,
    ]
  }, [excitedAnim, idleAnim])
  
  const { actions } = useAnimations(animations, group)
  
  // Play animation based on prop
  useEffect(() => {
    if (actions[animation]) {
      // Stop all other animations
      Object.values(actions).forEach(action => action?.stop())
      
      // Play selected animation
      actions[animation]?.reset().fadeIn(0.5).play()
      
      return () => actions[animation]?.fadeOut(0.5)
    }
  }, [animation, actions])

  return (
    <group rotation-x={-Math.PI / 2}>
      <group ref={group} {...props} dispose={null}>
        <primitive object={nodes.Hips} />
        <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
        <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
        <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
        <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
        <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
        <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
        <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
        <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
        <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
      </group>
    </group>
  )
}

useGLTF.preload('models/68e4b8a83448aa53be996b56.glb')

























