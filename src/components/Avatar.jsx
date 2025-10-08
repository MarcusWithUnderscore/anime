import React, { useEffect, useRef, useState } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useFBX, useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { button, useControls } from 'leva'
import * as THREE from "three"
// Import expressions from JSON file
import facialExpressions from '../../public/expressions.json'

// Animation configuration
const ANIMATIONS = {
  excited: "animations/Excited.fbx",
  idle: "animations/Idle.fbx",
}

export function Avatar({ animation = "excited", facialExpression = "default", ...props }) {
  const group = useRef()
  const { scene } = useGLTF('models/new-model.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  
  // Load animations
  const excitedAnim = useFBX(ANIMATIONS.excited)
  const idleAnim = useFBX(ANIMATIONS.idle)
  
  // Prepare animations array
  const animations = React.useMemo(() => {
    excitedAnim.animations[0].name = "excited"
    idleAnim.animations[0].name = "idle"
    
    return [
      ...excitedAnim.animations,
      ...idleAnim.animations,
    ]
  }, [excitedAnim, idleAnim])
  
  const { actions, mixer } = useAnimations(animations, group)
  
  // State
  const [currentExpression, setCurrentExpression] = useState(facialExpression)
  const [blink, setBlink] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [zoomLevel, setZoomLevel] = useState('full') // 'full', 'face', 'upper'
  
  // Store all meshes with morph targets
  const morphTargetMeshes = useRef([])
  const allMorphTargets = useRef([])

  // Play animation based on prop
  useEffect(() => {
    if (actions[animation]) {
      Object.values(actions).forEach(action => action?.stop())
      actions[animation]?.reset().fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5).play()
      return () => {
        if (actions[animation]) {
          actions[animation].fadeOut(0.5)
        }
      }
    }
  }, [animation, actions, mixer])

  // Update facial expression when prop changes
  useEffect(() => {
    setCurrentExpression(facialExpression)
  }, [facialExpression])

  // Find all meshes with morph targets on mount
  useEffect(() => {
    morphTargetMeshes.current = []
    const targetSet = new Set()
    
    clone.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        console.log('✅ Found mesh with morph targets:', child.name)
        console.log('   Morph targets:', Object.keys(child.morphTargetDictionary))
        morphTargetMeshes.current.push(child)
        
        // Collect all unique morph targets
        Object.keys(child.morphTargetDictionary).forEach(targetName => {
          targetSet.add(targetName)
        })
      }
    })
    
    allMorphTargets.current = Array.from(targetSet).sort()
    
    if (morphTargetMeshes.current.length === 0) {
      console.error('❌ NO MESHES WITH MORPH TARGETS FOUND!')
    } else {
      console.log(`✅ Found ${morphTargetMeshes.current.length} meshes with morph targets`)
      console.log('📋 All unique morph targets:', allMorphTargets.current)
      console.log('\n=== COPY-PASTE TEMPLATE ===')
      console.log('const newExpression = {')
      allMorphTargets.current.forEach(target => {
        console.log(`  ${target}: 0,`)
      })
      console.log('}')
    }
  }, [clone])

  // Apply morph target to all meshes
  const applyMorphTarget = (targetName, value) => {
    let applied = false
    morphTargetMeshes.current.forEach((mesh) => {
      const index = mesh.morphTargetDictionary[targetName]
      if (index !== undefined && mesh.morphTargetInfluences[index] !== undefined) {
        mesh.morphTargetInfluences[index] = value
        applied = true
      }
    })
    return applied
  }

  // Animation frame
  useFrame(() => {
    if (morphTargetMeshes.current.length === 0) return

    if (isSetupMode) {
      // Manual control mode - apply manual controls
      Object.keys(manualControls).forEach(key => {
        applyMorphTarget(key, manualControls[key])
      })
    } else {
      // Expression mode - reset all first, then apply expression
      allMorphTargets.current.forEach(target => {
        applyMorphTarget(target, 0)
      })
      
      const expression = facialExpressions[currentExpression] || facialExpressions.default
      Object.keys(expression).forEach(key => {
        applyMorphTarget(key, expression[key])
      })
    }

    // Blinking (always active unless in manual mode)
    if (!isSetupMode) {
      applyMorphTarget('eyeBlinkLeft', blink ? 1 : 0)
      applyMorphTarget('eyeBlinkRight', blink ? 1 : 0)
    }
  })

  // Manual controls - ALL 52 morph targets (must be declared BEFORE facial expression controls)
  const manualControls = useControls("Manual Controls (Scroll to see all 52)", {
    // Eyebrows
    browDownLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    browDownRight: { value: 0, min: 0, max: 1, step: 0.01 },
    browInnerUp: { value: 0, min: 0, max: 1, step: 0.01 },
    browOuterUpLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    browOuterUpRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Cheeks
    cheekPuff: { value: 0, min: 0, max: 1, step: 0.01 },
    cheekSquintLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    cheekSquintRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Blink
    eyeBlinkLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeBlinkRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Look Down
    eyeLookDownLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeLookDownRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Look In
    eyeLookInLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeLookInRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Look Out
    eyeLookOutLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeLookOutRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Look Up
    eyeLookUpLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeLookUpRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Squint
    eyeSquintLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeSquintRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Eye Wide
    eyeWideLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    eyeWideRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Jaw
    jawForward: { value: 0, min: 0, max: 1, step: 0.01 },
    jawLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    jawOpen: { value: 0, min: 0, max: 1, step: 0.01 },
    jawRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Mouth
    mouthClose: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthDimpleLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthDimpleRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthFrownLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthFrownRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthFunnel: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthLowerDownLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthLowerDownRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthPressLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthPressRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthPucker: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthRollLower: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthRollUpper: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthShrugLower: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthShrugUpper: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthSmileLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthSmileRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthStretchLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthStretchRight: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthUpperUpLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    mouthUpperUpRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Nose
    noseSneerLeft: { value: 0, min: 0, max: 1, step: 0.01 },
    noseSneerRight: { value: 0, min: 0, max: 1, step: 0.01 },
    
    // Tongue
    tongueOut: { value: 0, min: 0, max: 1, step: 0.01 },
  })

  // Leva controls
  useControls("Facial Expression", {
    expression: {
      value: currentExpression,
      options: Object.keys(facialExpressions),
      onChange: (value) => {
        console.log('🎭 Changing expression to:', value)
        setCurrentExpression(value)
      },
    },
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
    },
    setupMode: {
      value: isSetupMode,
      label: "Manual Control Mode",
      onChange: (value) => {
        setIsSetupMode(value)
        console.log(value ? "✅ Manual mode ON" : "❌ Manual mode OFF")
      }
    },
    zoomLevel: {
      value: zoomLevel,
      label: "Camera Zoom",
      options: {
        'Full Body': 'full',
        'Upper Body': 'upper',
        'Face Only': 'face',
      },
      onChange: (value) => {
        setZoomLevel(value)
        console.log('📷 Zoom:', value)
      }
    },
    printAllTargets: button(() => {
      console.log('=== ALL MORPH TARGETS ===')
      console.log('Total count:', allMorphTargets.current.length)
      allMorphTargets.current.forEach((target, i) => {
        console.log(`${i + 1}. ${target}`)
      })
      console.log('\n=== COPY-PASTE TEMPLATE ===')
      console.log('const newExpression = {')
      allMorphTargets.current.forEach(target => {
        console.log(`  ${target}: 0,`)
      })
      console.log('}')
    }),
    saveCurrentExpression: button(() => {
      console.log('\n=== 💾 SAVE YOUR CUSTOM EXPRESSION ===')
      console.log('Copy this into your facialExpressions object:\n')
      console.log('myCustomExpression: {')
      let hasValues = false
      Object.keys(manualControls).forEach(key => {
        if (manualControls[key] > 0) {
          console.log(`  ${key}: ${manualControls[key].toFixed(2)},`)
          hasValues = true
        }
      })
      if (!hasValues) {
        console.log('  // No morph targets active! Adjust sliders first.')
      }
      console.log('},\n')
    }),
    testAll: button(() => {
      console.log('🧪 Testing ALL morph targets (3 seconds each)...')
      const targets = allMorphTargets.current
      let index = 0
      
      const testNext = () => {
        if (index >= targets.length) {
          console.log('✅ Test complete!')
          return
        }
        
        const target = targets[index]
        console.log(`Testing ${index + 1}/${targets.length}: ${target}`)
        applyMorphTarget(target, 1)
        
        setTimeout(() => {
          applyMorphTarget(target, 0)
          index++
          testNext()
        }, 3000)
      }
      
      testNext()
    }),
    debugMeshes: button(() => {
      console.log('=== DEBUG INFO ===')
      console.log('Meshes with morph targets:', morphTargetMeshes.current.length)
      morphTargetMeshes.current.forEach((mesh, i) => {
        console.log(`\nMesh ${i}: ${mesh.name}`)
        console.log('  Dictionary:', mesh.morphTargetDictionary)
        console.log('  Current influences:', mesh.morphTargetInfluences)
      })
    }),
  })

  // Auto-blink
  useEffect(() => {
    let blinkTimeout
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          nextBlink()
        }, 200)
      }, THREE.MathUtils.randInt(1000, 5000))
    }
    nextBlink()
    return () => clearTimeout(blinkTimeout)
  }, [])

  return (
    <group 
      rotation-x={-Math.PI / 2}
      position-y={
        zoomLevel === 'face' ? -1.5 : 
        zoomLevel === 'upper' ? -0.8 : 
        0
      }
      scale={
        zoomLevel === 'face' ? 2.5 : 
        zoomLevel === 'upper' ? 1.5 : 
        1
      }
    >
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

useGLTF.preload('models/new-model.glb')