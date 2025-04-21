/**
 * CameraController Component
 * 
 * This component handles the camera transitions between different eras.
 * It animates the camera position and rotation smoothly using GSAP.
 * 
 * Features:
 * - Smooth transitions between camera positions
 * - Automatic look-at functionality targeting the center of the scene
 * - Integration with OrbitControls for manual camera interaction
 * - Transition tracking to prevent conflicts during animation
 */

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { useEraStore } from '../store/eraStore';
import { OrbitControls } from 'three-stdlib';

export default function CameraController() {
  const { camera, controls } = useThree();
  const { currentEra } = useEraStore();
  const targetPosition = useRef(new Vector3(...currentEra.cameraPos));
  const isTransitioning = useRef(false);
  
  // Update target position when era changes
  useEffect(() => {
    targetPosition.current = new Vector3(...currentEra.cameraPos);
    isTransitioning.current = true;
    
    // Animate camera position using GSAP
    gsap.to(camera.position, {
      x: targetPosition.current.x,
      y: targetPosition.current.y,
      z: targetPosition.current.z,
      duration: 1.8,
      ease: 'power2.inOut',
      onComplete: () => {
        isTransitioning.current = false;
      }
    });
    
    // Animate camera to look at origin
    gsap.to(camera.rotation, {
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
        // If there are orbit controls, update them
        if (controls && 'update' in controls) {
          (controls as any).update();
        }
      },
    });
  }, [camera, controls, currentEra]);
  
  return null;
} 