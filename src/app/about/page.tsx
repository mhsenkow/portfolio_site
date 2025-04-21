/**
 * About Me Page
 * 
 * This page provides information about the portfolio owner.
 * It uses the same 3D particle system to create interesting visual elements.
 */

'use client'

import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, OrbitControls } from '@react-three/drei';
import CubeField from '../../components/CubeField';
import Link from 'next/link';

// Special ShapeParticles component for the About page
function AboutParticles() {
  return (
    <CubeField count={4000} size={0.05} />
  );
}

export default function AboutPage() {
  const controlsRef = useRef(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  return (
    <main className="w-full h-screen flex flex-col relative overflow-hidden">
      {/* Background color */}
      <div className="absolute inset-0" style={{ backgroundColor: '#121212' }} />
      
      {/* Title and navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        {/* Title */}
        <div className="text-white">
          <Link href="/" className="hover:opacity-80 transition">
            <h1 className="text-2xl font-bold tracking-tight">I Build Machines</h1>
            <p className="text-sm opacity-70">A 3D Particle-Based Narrative Portfolio</p>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-6 items-center">
          <Link href="/about" className="text-white hover:text-opacity-80 transition font-bold border-b-2 border-white">
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
                <span>Previous project (on portfolio page)</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">→</span>
                <span>Next project (on portfolio page)</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">↑</span>
                <span>Previous company/era (on portfolio page)</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-700 px-2 rounded mr-3 font-mono">↓</span>
                <span>Next company/era (on portfolio page)</span>
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
      
      {/* 3D Canvas - smaller, positioned to the right */}
      <div className="absolute right-0 top-0 w-[50%] h-screen">
        <Canvas
          shadows
          camera={{ position: [0, 0, 15], fov: 75 }}
        >
          <Suspense fallback={null}>
            {/* Scene lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.5} 
              castShadow 
            />
            
            {/* Particles in shape of human figure or relevant shape */}
            <AboutParticles />
            
            {/* Add orbit controls for interactive camera */}
            <OrbitControls 
              ref={controlsRef}
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Content - positioned to the left */}
      <div className="w-1/2 h-full p-16 flex flex-col justify-center overflow-y-auto">
        <div className="text-white max-w-xl">
          <h2 className="text-4xl font-bold mb-6">Hello!</h2>
          
          <div className="space-y-6 text-gray-300">
            <p>
              I'm Michael, a product designer passionate about the intersection of 
              <span className="text-white font-semibold"> artificial intelligence, human-centered design, big data, and software development</span>. 
              I thrive where <span className="text-white font-semibold">DESIGN</span> and <span className="text-white font-semibold">TECHNOLOGY</span> meet, 
              whether it's using 3D printers and CNC-controlled robots to create art or 
              <span className="text-white font-semibold"> reimagining enterprise applications to enhance our work-life balance</span>. 
              I love exploring big-picture ideas and diving into the details that 
              <span className="text-white font-semibold"> make applications not just functional but delightful</span>.
            </p>
            
            <p>
              I hold a <span className="text-white font-semibold">Master's in Information Science, focusing on Human-Computer Interaction</span>, 
              from <a href="https://www.umich.edu/" className="text-blue-400 hover:text-blue-300">the University of Michigan</a>, 
              and a <span className="text-white font-semibold">dual Bachelor's in Mechanical Engineering and Technical Communications</span> from 
              <a href="https://www.mtu.edu/" className="text-blue-400 hover:text-blue-300"> Michigan Technological University</a>. 
              My early career included <span className="text-white font-semibold">technical roles at startups</span> in Boston, 
              <span className="text-white font-semibold"> design research for Architecture professors</span> during grad school, 
              and an <span className="text-white font-semibold">internship at Apple</span> in Cupertino.
            </p>
            
            <p className="text-xl font-bold">
              Currently I'm freelancing and looking for that next big step.
            </p>
            
            <p>
              Most recently I was providing initial design guidance and branding for a start-up 
              <a href="#" className="text-blue-400 hover:text-blue-300"> Supio</a>, 
              and working in <a href="https://meta.com" className="text-blue-400 hover:text-blue-300">Meta's</a> internal applications covering 
              <span className="text-white font-semibold"> Analysis workflows across Daiquery, Bento, Data Explorer</span> 
              and frameworks for Data-viz systems.
            </p>
            
            <p>
              Before that I was at <a href="https://microsoft.com" className="text-blue-400 hover:text-blue-300">Microsoft</a> working on 
              <a href="https://www.microsoft.com/en-us/microsoft-teams" className="text-blue-400 hover:text-blue-300"> Teams</a> 
              and MyAnalytics and Workplace Analytics (now 
              <span className="text-white font-semibold"> branded Viva Insights</span>) 
              as a mixture of design lead and individual contributor designer. At 
              <a href="https://ibm.com" className="text-blue-400 hover:text-blue-300"> IBM</a> 
              I was in <span className="text-white font-semibold">the first group of 60 that was at the start of the Design movement at IBM</span> 
              and had been with the company for four years, priorly working on 
              <span className="text-white font-semibold"> Watson Analytics</span> projects 
              and aided in building Data-Viz and both the UX and Technical sides of the 
              <span className="text-white font-semibold"> Watson Data Platform</span> Design Guide that folded into their current 
              <a href="https://carbondesignsystem.com/" className="text-blue-400 hover:text-blue-300"> Carbon Blue design system</a>.
            </p>
            
            <p>
              Always happy to discuss design and technology, feel free to reach out!
            </p>
            
            <h3 className="text-2xl font-bold mt-8 mb-4">Skills & Expertise</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 p-3 rounded">
                <h4 className="font-bold mb-1">UX/UI Design</h4>
                <p className="text-sm">Human-Centered Design, Enterprise Apps, Information Architecture</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded">
                <h4 className="font-bold mb-1">Data Visualization</h4>
                <p className="text-sm">D3.js, Dashboard Design, Complex Data Systems</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded">
                <h4 className="font-bold mb-1">Frontend Development</h4>
                <p className="text-sm">React, TypeScript, Three.js, Next.js</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded">
                <h4 className="font-bold mb-1">AI/ML Integration</h4>
                <p className="text-sm">AI UI Design Patterns, Analytics Systems, Platform Design</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      <Loader />
    </main>
  );
} 