/**
 * GhostNarrative Component
 * 
 * This component displays floating narrative text in 3D space when navigating
 * between different eras, creating an ethereal storytelling element.
 * 
 * Features:
 * - 3D text that fades in and out with era changes
 * - Text that floats and moves in 3D space
 * - Automatic positioning near camera's focus
 * - Smooth transitions using GSAP animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useEraStore } from '../store/eraStore';

export default function GhostNarrative() {
  const { scene } = useThree();
  const { currentEra } = useEraStore();
  const textRef = useRef<THREE.Mesh>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Show narrative when era changes
  useEffect(() => {
    // Skip animation if text isn't loaded yet
    if (!textRef.current) return;
    
    // Reset
    gsap.killTweensOf(textRef.current.material);
    gsap.killTweensOf(textRef.current.position);
    
    // Get random position near camera focus
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2 + 1,
      (Math.random() - 0.5) * 3
    );
    
    // Set initial position and opacity
    if (textRef.current.material instanceof THREE.Material) {
      textRef.current.material.opacity = 0;
    }
    textRef.current.position.copy(randomOffset);
    
    // Show text with animation
    setIsVisible(true);
    
    // Animate opacity (fade in)
    gsap.to(textRef.current.material, {
      opacity: 0.7,
      duration: 2,
      ease: 'power2.inOut',
    });
    
    // Animate position (float up slightly)
    gsap.to(textRef.current.position, {
      y: randomOffset.y + 0.5,
      duration: 8,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });
    
    // After 8 seconds, fade out
    setTimeout(() => {
      if (textRef.current) {
        gsap.to(textRef.current.material, {
          opacity: 0,
          duration: 2,
          ease: 'power2.inOut',
          onComplete: () => setIsVisible(false),
        });
      }
    }, 8000);
  }, [currentEra]);
  
  if (!isVisible) return null;
  
  return (
    <Text
      ref={textRef}
      fontSize={0.15}
      maxWidth={4}
      lineHeight={1.2}
      letterSpacing={0.02}
      textAlign="center"
      material-transparent={true}
      material-opacity={0}
      anchorX="center"
      anchorY="middle"
      color="#ffffff"
    >
      {currentEra.narrative}
    </Text>
  );
} 