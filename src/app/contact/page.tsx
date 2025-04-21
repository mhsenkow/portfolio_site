/**
 * Contact Page
 * 
 * This page provides contact information and a form to reach out.
 * It uses the same 3D particle system to create interesting visual elements.
 */

'use client'

import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, OrbitControls } from '@react-three/drei';
import CubeField from '../../components/CubeField';
import Link from 'next/link';

// Special ShapeParticles component for the Contact page
function ContactParticles() {
  return (
    <CubeField count={3000} size={0.06} />
  );
}

export default function ContactPage() {
  const controlsRef = useRef(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  return (
    <main className="w-full h-screen flex flex-col relative overflow-hidden">
      {/* Background color */}
      <div className="absolute inset-0" style={{ backgroundColor: '#0D1A26' }} />
      
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
          <Link href="/about" className="text-white hover:text-opacity-80 transition">
            About Me
          </Link>
          <Link href="/contact" className="text-white hover:text-opacity-80 transition font-bold border-b-2 border-white">
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
      
      {/* Content - Contact Form */}
      <div className="w-1/2 h-full p-16 flex flex-col justify-center z-10">
        <div className="text-white max-w-xl">
          <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
          
          <p className="text-gray-300 mb-8">
            Have a project in mind or just want to say hello? Feel free to reach out!
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-black/30 border border-gray-600 rounded-md text-white"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 bg-black/30 border border-gray-600 rounded-md text-white"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea 
                  className="w-full p-2 bg-black/30 border border-gray-600 rounded-md text-white h-32"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button 
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-blue-400">hello@example.com</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Social</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-400 hover:text-blue-300">LinkedIn</a>
                <a href="#" className="text-blue-400 hover:text-blue-300">Twitter</a>
                <a href="#" className="text-blue-400 hover:text-blue-300">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3D Canvas - on the right side */}
      <div className="absolute right-0 top-0 w-[60%] h-screen">
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
            <pointLight position={[0, 5, 5]} intensity={0.8} color="#2563EB" />
            
            {/* Particles in shape related to contact/communication */}
            <ContactParticles />
            
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
      
      {/* Loading indicator */}
      <Loader />
    </main>
  );
} 