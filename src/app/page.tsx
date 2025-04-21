/**
 * Main Portfolio Page
 * 
 * This is the root component of the 3D particle-based portfolio application.
 * It orchestrates all the main components and manages the overall layout.
 * 
 * Features:
 * - Full-screen 3D canvas with responsive layout 
 * - Dynamic background color based on current era
 * - Camera and lighting setup with fog effects
 * - Integration of all core components:
 *   - CubeField (3D particles)
 *   - CameraController (camera transitions)
 *   - TimelineControl (era navigation)
 *   - GhostNarrative (floating text)
 *   - ProjectCarousel (project navigation)
 * - Orbit controls for user interaction
 * - Keyboard navigation (arrow keys)
 * 
 * The component uses the useEraStore to coordinate state changes across all sub-components.
 */

'use client'

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, OrbitControls } from '@react-three/drei';
import CubeField from '../components/CubeField';
import TimelineControl from '../components/TimelineControl';
import CameraController from '../components/CameraController';
import GhostNarrative from '../components/GhostNarrative';
import ProjectCarousel from '../components/ProjectCarousel';
import { useEraStore } from '../store/eraStore';
import { useProjectStore } from '../store/projectStore';
import ProjectInfoPanel from '../components/ProjectInfoPanel';
import Link from 'next/link';

export default function Home() {
  const { currentEra, setCurrentEraIndex, currentEraIndex } = useEraStore();
  const { hoveredProject } = useProjectStore();
  const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false);
  const controlsRef = useRef(null);
  
  // Handle keyboard navigation for era/company changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        // Navigate to previous era
        setCurrentEraIndex(Math.max(0, currentEraIndex - 1));
      } else if (e.key === 'ArrowDown') {
        // Navigate to next era
        setCurrentEraIndex(Math.min(currentEraIndex + 1, 7));  // Assuming 8 eras (0-7)
      } else if (e.key === '?') {
        // Toggle keyboard help
        setShowKeyboardHelp(prev => !prev);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentEraIndex, setCurrentEraIndex]);
  
  return (
    <main className="w-full h-screen flex flex-col relative overflow-hidden">
      {/* Background color based on current era */}
      <div 
        className="absolute inset-0 transition-colors duration-1000" 
        style={{ backgroundColor: currentEra.bgColor }}
      />
      
      {/* Title and navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        {/* Title */}
        <div className="text-white">
          <h1 className="text-2xl font-bold tracking-tight">I Build Machines</h1>
          <p className="text-sm opacity-70">A 3D Particle-Based Narrative Portfolio</p>
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-6 items-center">
          <Link href="/about" className="text-white hover:text-opacity-80 transition">
            About Me
          </Link>
          <Link href="/contact" className="text-white hover:text-opacity-80 transition">
            Contact
          </Link>
          <button 
            onClick={() => setShowKeyboardHelp(prev => !prev)}
            className="text-white text-xl opacity-70 hover:opacity-100 transition ml-4 bg-black/20 rounded-full w-8 h-8 flex items-center justify-center"
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>
      
      {/* Keyboard shortcuts help */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center" onClick={() => setShowKeyboardHelp(false)}>
          <div className="bg-gray-900 p-8 rounded-lg max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-3 text-gray-200">
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">←</span>
                <span>Previous project</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">→</span>
                <span>Next project</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">↑</span>
                <span>Previous company/era</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">↓</span>
                <span>Next company/era</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">?</span>
                <span>Toggle this help screen</span>
              </div>
            </div>
            <button 
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
              onClick={() => setShowKeyboardHelp(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Keyboard hint */}
      <div className="fixed bottom-40 right-4 text-white text-sm opacity-50 z-40 bg-black/30 px-3 py-1 rounded pointer-events-none">
        Press <span className="font-mono bg-black/20 px-1 rounded mx-1">?</span> for keyboard shortcuts
      </div>
      
      {/* 3D Canvas - ensure it takes up the full viewport height minus the timeline */}
      <div className="w-full h-[calc(100vh-80px)] relative">
        <Canvas
          shadows
          camera={{ position: [0, 5, 15], fov: 75 }}
          className="absolute inset-0"
        >
          <Suspense fallback={null}>
            {/* Scene lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.5} 
              castShadow 
              shadow-mapSize-width={1024} 
              shadow-mapSize-height={1024} 
            />
            
            {/* Fog based on current era */}
            <fog attach="fog" args={[currentEra.bgColor, 2, 30 / currentEra.fogDensity]} />
            
            {/* Camera controller for smooth transitions */}
            <CameraController />
            
            {/* Add orbit controls for interactive camera */}
            <OrbitControls 
              ref={controlsRef}
              enableZoom={true}
              enablePan={false}
              minDistance={5}
              maxDistance={30}
              dampingFactor={0.05}
              enableDamping={true}
            />
            
            {/* Cube field particles */}
            <CubeField count={7000} />
            
            {/* Ghost narrative text */}
            <GhostNarrative />
          </Suspense>
        </Canvas>
        
        {/* Loading indicator */}
        <Loader />
      </div>
      
      {/* Project carousel at the bottom of the screen */}
      <ProjectCarousel />
      
      {/* Timeline control fixed at the bottom */}
      <TimelineControl />
      
      {/* Project info panel - only show when a project is hovered */}
      {hoveredProject && <ProjectInfoPanel projectId={hoveredProject} />}
    </main>
  );
} 