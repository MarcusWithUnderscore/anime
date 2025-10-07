import React, { useEffect, useRef } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useFBX, useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function Avatar(props) {
  const group = useRef()
  const { scene } = useGLTF('models/68e4b8a83448aa53be996b56.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  
  // Load the FBX animation
  const { animations: excitedAnimation } = useFBX("animations/Excited.fbx")


  excitedAnimation[0].name = "excited"
  
  // Set up animations
  const { actions } = useAnimations(excitedAnimation, group)
  
  useEffect(() => {
    // Play the first animation (Excited)
    const action = actions[Object.keys(actions)[0]]
    action?.reset().fadeIn(0.5).play()
    
    return () => action?.fadeOut(0.5)
  }, [actions])

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