/**
 * CubeField Component
 * 
 * This component renders thousands of cube particles into various shapes using instancedMesh
 * for optimal performance. Each era in the portfolio has a unique shape formation,
 * with smooth transitions between shapes as the user navigates the timeline.
 * 
 * Features:
 * - Efficient rendering of thousands of particles using instancedMesh
 * - Shape formations based on era (sphere, helix, cube, grid/IBM bars, windows, torus, mobius, wave)
 * - Smooth transitions with staggered movement and custom easing
 * - Organic movement through noise functions
 * - Dynamic coloring based on current era
 * 
 * The component uses GSAP for smooth transitions and THREE.js for 3D rendering.
 */

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useEraStore } from '../store/eraStore';
import { useProjectStore } from '../store/projectStore';
import { mockProjects, Project } from './ProjectCarousel';
import gsap from 'gsap';
import { Html } from '@react-three/drei';

// Helper function to generate noise
const noise = (x: number, y: number, z: number, t: number, factor: number, speed: number) => {
  // Simple 3D noise function (could be improved with proper Perlin noise)
  const nx = Math.sin(x * factor + t * speed);
  const ny = Math.cos(y * factor + t * speed * 0.8);
  const nz = Math.sin(z * factor + t * speed * 1.2);
  return (nx + ny + nz) * 0.3;
};

// Define cube interface
interface Cube {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  initialPosition: THREE.Vector3; // Starting position for transitions
  scale: number;
  rotation: THREE.Euler;
  baseScale: number;
  index: number;
  isProject: boolean; // Flag to mark project cubes
  projectId?: string; // Optional project identifier
  projectColor?: string; // Optional project color
  eraId?: string; // Associated era/company
}

// Helper function to determine if a cube should be a project
const shouldBeProject = (index: number, total: number): boolean => {
  // Only make specific indexes into project cubes to match our mockProjects data
  return [1009, 2013, 3019, 4021, 5031, 6033, 7039].includes(index);
};

// Find project by index
const getProjectByIndex = (index: number): Project | undefined => {
  return mockProjects.find(p => p.id === `project-${index}`);
};

// Shape generation functions
const generateShapePosition = (shape: string, i: number, count: number, scale: number = 8): THREE.Vector3 => {
  const t = i / count;
  const phi = Math.acos(-1 + 2 * t);
  const theta = Math.sqrt(count * Math.PI) * phi;
  
  let x = 0, y = 0, z = 0;
  
  switch (shape) {
    case 'sphere':
      // Fibonacci sphere distribution
      x = scale * Math.cos(theta) * Math.sin(phi);
      y = scale * Math.sin(theta) * Math.sin(phi);
      z = scale * Math.cos(phi);
      // Add some jitter for natural look
      x += (Math.random() - 0.5) * scale * 0.1;
      y += (Math.random() - 0.5) * scale * 0.1;
      z += (Math.random() - 0.5) * scale * 0.1;
      break;
      
    case 'cube':
      // Cube distribution
      const sideLength = Math.pow(count, 1/3);
      const cubeIndex = i % Math.floor(Math.pow(sideLength, 3));
      const ix = Math.floor(cubeIndex / (sideLength * sideLength));
      const iy = Math.floor((cubeIndex / sideLength) % sideLength);
      const iz = cubeIndex % sideLength;
      
      x = (ix / sideLength - 0.5) * scale;
      y = (iy / sideLength - 0.5) * scale;
      z = (iz / sideLength - 0.5) * scale;
      
      // Only place particles on the shell of the cube
      if (i % 2 === 0 || Math.random() > 0.8) {
        // Pick a face
        const face = Math.floor(Math.random() * 6);
        switch (face) {
          case 0: x = scale/2; break;
          case 1: x = -scale/2; break;
          case 2: y = scale/2; break;
          case 3: y = -scale/2; break;
          case 4: z = scale/2; break;
          case 5: z = -scale/2; break;
        }
        x += (Math.random() - 0.5) * 0.5;
        y += (Math.random() - 0.5) * 0.5;
        z += (Math.random() - 0.5) * 0.5;
      }
      break;
      
    case 'helix':
      // Double helix for DNA-like structure (academic research)
      const helixT = (i / count) * Math.PI * 10;
      const radius = scale / 2;
      
      if (i % 2 === 0) {
        x = radius * Math.cos(helixT);
        z = radius * Math.sin(helixT);
        y = (helixT - Math.PI * 5) * scale / 10;
      } else {
        x = radius * Math.cos(helixT + Math.PI);
        z = radius * Math.sin(helixT + Math.PI);
        y = (helixT - Math.PI * 5) * scale / 10;
      }
      
      // Add connecting "rungs" occasionally
      if (i % 30 < 2 && i > 0) {
        const t2 = ((i-1) / count) * Math.PI * 10;
        x = radius * Math.cos(t2) * (i % 30) + radius * Math.cos(t2 + Math.PI) * (1 - i % 30);
        z = radius * Math.sin(t2) * (i % 30) + radius * Math.sin(t2 + Math.PI) * (1 - i % 30);
        y = (t2 - Math.PI * 5) * scale / 10;
      }
      break;
      
    case 'grid':
      // IBM-inspired 8-bar logo pattern forming a cube-like structure
      // Three sets of 8 bars (24 total) arranged in X, Y, and Z planes
      
      // Determine which set of bars this particle belongs to
      const barSet = i % 3; // 0, 1, or 2 (X, Y, or Z planes)
      const barWithinSet = Math.floor(i / 3) % 8; // Which bar within the set (0-7)
      const positionInBar = (Math.floor(i / 24) % 100) / 100; // Position along the bar length
      
      // Scale factors
      const outerSize = scale * 0.7; // Size of the overall structure
      const barThickness = scale * 0.08; // Thickness of each bar
      const barSpacing = outerSize / 8; // Space between bars
      
      // Calculate base position based on which bar set and which bar in the set
      switch (barSet) {
        case 0: // X-oriented bars (horizontal, varying in Z)
          x = -outerSize/2 + positionInBar * outerSize;
          y = -outerSize/2 + barWithinSet * barSpacing + barSpacing/2;
          z = outerSize/2 - barThickness/2;
          break;
          
        case 1: // Y-oriented bars (vertical, varying in X)
          x = -outerSize/2 + barWithinSet * barSpacing + barSpacing/2;
          y = -outerSize/2 + positionInBar * outerSize;
          z = -outerSize/2 + barThickness/2;
          break;
          
        case 2: // Z-oriented bars (depth, varying in Y)
          x = outerSize/2 - barThickness/2;
          y = -outerSize/2 + barWithinSet * barSpacing + barSpacing/2;
          z = -outerSize/2 + positionInBar * outerSize;
          break;
      }
      
      // Add subtle variations to make it more organic
      if (i % 12 === 0) {
        const jitter = 0.05;
        x += (Math.random() - 0.5) * jitter;
        y += (Math.random() - 0.5) * jitter;
        z += (Math.random() - 0.5) * jitter;
      }
      
      // Rotate the entire structure a bit for better viewing angle
      const rotationAngle = Math.PI * 0.2;
      const originalX = x;
      const originalZ = z;
      x = originalX * Math.cos(rotationAngle) - originalZ * Math.sin(rotationAngle);
      z = originalX * Math.sin(rotationAngle) + originalZ * Math.cos(rotationAngle);
      
      break;
      
    case 'windows':
      // Microsoft Windows-like structure
      const windowPaneSize = Math.sqrt(count / 4);
      const quadrant = Math.floor(i / (count / 4));
      const paneIndex = i % Math.floor(count / 4);
      const ix3 = Math.floor(paneIndex / windowPaneSize);
      const iz3 = paneIndex % Math.floor(windowPaneSize);
      
      x = (ix3 / windowPaneSize - 0.5) * scale;
      z = (iz3 / windowPaneSize - 0.5) * scale;
      
      // Offset based on quadrant (like Windows logo)
      if (quadrant === 1 || quadrant === 3) x += scale * 0.6;
      if (quadrant === 2 || quadrant === 3) z += scale * 0.6;
      
      // Add some jitter
      x += (Math.random() - 0.5) * 0.2;
      z += (Math.random() - 0.5) * 0.2;
      y = (Math.random() - 0.5) * scale * 0.1;
      break;
      
    case 'torus':
      // Metaverse ring/torus (for Meta)
      const torusR = scale * 0.7; // big radius
      const tubeR = scale * 0.2; // tube radius
      
      // Parameter along the strip (0 to 2π)
      const torusU = (i / count) * Math.PI * 2;
      const torusV = (i % 20) / 20 * Math.PI * 2;
      
      x = (torusR + tubeR * Math.cos(torusV)) * Math.cos(torusU);
      z = (torusR + tubeR * Math.cos(torusV)) * Math.sin(torusU);
      y = tubeR * Math.sin(torusV);
      
      // Add some particles in the center (metaverse concept)
      if (i % 50 === 0) {
        const centerRadius = Math.random() * scale * 0.4;
        const centerAngle = Math.random() * Math.PI * 2;
        x = centerRadius * Math.cos(centerAngle);
        z = centerRadius * Math.sin(centerAngle);
        y = (Math.random() - 0.5) * scale * 0.5;
      }
      break;
      
    case 'mobius':
      // Möbius strip
      const mobiusR = scale * 0.7;  // Major radius
      const mobiusW = scale * 0.3;  // Width of the strip
      
      // Parameter along the strip (0 to 2π)
      const mobiusU = (i / count) * Math.PI * 2;
      
      // Parameter across the strip with varied distribution
      let mobiusV;
      if (i % 5 === 0) {
        // Concentrate points at the edges for better definition
        mobiusV = Math.sign(Math.random() - 0.5) * (0.4 + Math.random() * 0.1);
      } else {
        // Distribute points across the strip
        mobiusV = ((i % 100) / 100 - 0.5) * (0.8 + Math.random() * 0.4);
      }
      
      // Add subtle variation to the strip's width
      const varyingWidth = mobiusW * (1 + 0.2 * Math.sin(mobiusU * 3));
      
      // Apply Möbius strip parametric equations with enhancements
      // This creates the twist in the strip
      x = (mobiusR + varyingWidth * mobiusV * Math.cos(mobiusU / 2)) * Math.cos(mobiusU);
      z = (mobiusR + varyingWidth * mobiusV * Math.cos(mobiusU / 2)) * Math.sin(mobiusU);
      y = varyingWidth * mobiusV * Math.sin(mobiusU / 2);
      
      // Add some variation to make it more organic
      if (i % 20 === 0) {
        // Create a "flow" of particles that follow the Möbius strip but hover above it
        const flowHeight = 0.2 + Math.random() * 0.3;
        const flowDirection = new THREE.Vector3(
          -Math.sin(mobiusU),
          0,
          Math.cos(mobiusU)
        ).normalize();
        
        x += flowDirection.x * flowHeight;
        y += flowHeight * 1.5;
        z += flowDirection.z * flowHeight;
      }
      
      // Create a few particles that orbit the strip to suggest movement and energy
      if (i % 50 === 0) {
        const orbitRadius = mobiusR * (1.2 + Math.random() * 0.3);
        const orbitAngle = Math.random() * Math.PI * 2;
        const orbitHeight = (Math.random() - 0.5) * scale * 0.5;
        
        x = Math.cos(orbitAngle) * orbitRadius;
        z = Math.sin(orbitAngle) * orbitRadius;
        y = orbitHeight;
      }
      break;
      
    case 'wave':
      // Wave pattern - dynamic, fluid
      const waveT = (i / count) * Math.PI * 4;
      const waveSegments = Math.sqrt(count);
      const waveIx = Math.floor(i / waveSegments);
      const waveIz = i % Math.floor(waveSegments);
      
      x = (waveIx / waveSegments - 0.5) * scale;
      z = (waveIz / waveSegments - 0.5) * scale;
      
      // Apply wave function
      y = Math.sin(x * 0.5 + z * 0.5) * scale * 0.2;
      
      // Add flowing appearance
      if (i % 3 === 0) {
        y += Math.sin(waveT) * scale * 0.1;
      }
      break;
      
    case 'ox':
      // Same implementation as mobius but with different parameters
      // Reusing the mobius implementation to avoid duplicate code
      const oxMobiusR = scale * 0.7;  // Major radius
      const oxMobiusW = scale * 0.2;  // Width of the strip
      
      // Parameter along the strip (0 to 2π)
      const oxMobiusU = (i / count) * Math.PI * 2;
      
      // Parameter across the strip (-0.5 to 0.5)
      const oxMobiusV = ((i % 100) / 100) - 0.5;
      
      // Apply Möbius strip parametric equations
      // This creates the twist in the strip
      x = (oxMobiusR + oxMobiusW * oxMobiusV * Math.cos(oxMobiusU / 2)) * Math.cos(oxMobiusU);
      z = (oxMobiusR + oxMobiusW * oxMobiusV * Math.cos(oxMobiusU / 2)) * Math.sin(oxMobiusU);
      y = oxMobiusW * oxMobiusV * Math.sin(oxMobiusU / 2);
      
      // Add some variation to make it more organic
      if (i % 20 === 0) {
        // Create a "flow" of particles that follow the Möbius strip but hover above it
        const flowHeight = 0.2 + Math.random() * 0.3;
        const flowDirection = new THREE.Vector3(
          -Math.sin(oxMobiusU),
          0,
          Math.cos(oxMobiusU)
        ).normalize();
        
        x += flowDirection.x * flowHeight;
        y += flowHeight * 1.5;
        z += flowDirection.z * flowHeight;
      }
      
      // Create a few particles that orbit the strip to suggest movement and energy
      if (i % 50 === 0) {
        const orbitRadius = oxMobiusR * (1.2 + Math.random() * 0.3);
        const orbitAngle = Math.random() * Math.PI * 2;
        const orbitHeight = (Math.random() - 0.5) * scale * 0.5;
        
        x = Math.cos(orbitAngle) * orbitRadius;
        z = Math.sin(orbitAngle) * orbitRadius;
        y = orbitHeight;
      }
      break;
      
    default:
      // Fallback - random distribution
      x = (Math.random() - 0.5) * scale;
      y = (Math.random() - 0.5) * scale;
      z = (Math.random() - 0.5) * scale;
  }
  
  return new THREE.Vector3(x, y, z);
};

// Keep track of project cube instances for hover detection
interface ProjectInstance {
  cube: Cube;
  meshRef: React.RefObject<THREE.Mesh>;
  project: Project;
}

type CubeFieldProps = {
  count?: number;
  size?: number;
  gridSize?: number;
};

export default function CubeField({ count = 7000, size = 0.04, gridSize = 25 }: CubeFieldProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const { eras, currentEra, currentEraIndex, previousEraIndex } = useEraStore();
  const { hoveredProject, setHoveredProject, setSelectedProject, getEraForProject } = useProjectStore();
  const [transitioning, setTransitioning] = useState(false);
  const transitionRef = useRef({
    progress: 0,
    duration: 3.0, // Longer duration for smoother transition
    ease: "power2.inOut",
    animation: null as gsap.core.Tween | null
  });
  const lastEraRef = useRef(currentEra.id);
  const [initialized, setInitialized] = useState(false);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  
  // Track project cube mesh references
  const projectInstances = useRef<ProjectInstance[]>([]);
  
  // Keep a reference to the last hovered project
  const lastHoveredRef = useRef<string | null>(null);
  
  // Reference to track the elapsed time from the animation frame
  const clockRef = useRef({ elapsedTime: 0 });
  
  // Reference to ensure a project is always focused when none is hovered
  const defaultProjectRef = useRef<string | null>(null);

  // Generate initial cube positions
  const cubes = useMemo(() => {
    const temp: Cube[] = [];
    
    for (let i = 0; i < count; i++) {
      // Determine if this cube should be a project
      const isProject = shouldBeProject(i, count);
      const project = isProject ? getProjectByIndex(i) : undefined;
      const projectId = project?.id;
      
      // Get associated era for this project
      let eraId: string | undefined = undefined;
      if (projectId) {
        const projectEra = getEraForProject(projectId);
        if (projectEra) {
          eraId = projectEra;
        }
      }
      
      // Generate initial shape based on first era
      const position = generateShapePosition(
        eras[0].shape, 
        i, 
        count, 
        eras[0].shapeScale
      );
      
      // Random scale with bimodal distribution for visual interest
      let baseScale = Math.random() > 0.95 
        ? Math.random() * 0.8 + 1.2 // 5% larger particles
        : Math.random() * 0.4 + 0.6; // 95% normal size
        
      // Make project cubes significantly larger
      if (isProject) {
        baseScale *= 4.0; // 4x larger for project cubes (increased from 3x)
      }
      
      // Add initial properties
      temp.push({
        position: position.clone(), // Current position
        initialPosition: position.clone(), // Starting position for transitions
        targetPosition: position.clone(), // Target for animation
        scale: baseScale,
        baseScale,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        index: i,
        isProject,
        projectId,
        eraId
      });
    }
    return temp;
  }, [count, eras, getEraForProject]); // Add getEraForProject as a dependency
  
  // Initialize the cubes to the current era on first render
  useEffect(() => {
    if (!initialized && cubes.length > 0) {
      // Set the initial positions to match the current era
      cubes.forEach((cube, i) => {
        const targetPos = generateShapePosition(
          currentEra.shape,
          cube.index,
          count,
          currentEra.shapeScale
        );
        
        // Set all positions to match the current era
        cube.position.copy(targetPos);
        cube.initialPosition.copy(targetPos);
        cube.targetPosition.copy(targetPos);
      });
      
      setInitialized(true);
    }
  }, [initialized, cubes, currentEra, count]);
  
  // Update target positions when era changes
  useEffect(() => {
    // Skip the first render since we handle that separately
    if (!initialized) return;
    
    if (lastEraRef.current !== currentEra.id) {
      // Kill any ongoing animation
      if (transitionRef.current.animation) {
        transitionRef.current.animation.kill();
      }
      
      setTransitioning(true);
      transitionRef.current.progress = 0;
      
      // Store current positions as initial positions for the transition
      cubes.forEach((cube) => {
        cube.initialPosition.copy(cube.position);
      });
      
      // Calculate new target positions based on new era shape
      cubes.forEach((cube, i) => {
        // Generate the target position for this specific particle in the new shape
        cube.targetPosition = generateShapePosition(
          currentEra.shape,
          cube.index,
          count,
          currentEra.shapeScale
        );
      });
      
      // Animate the transition
      transitionRef.current.animation = gsap.to(transitionRef.current, {
        progress: 1,
        duration: transitionRef.current.duration,
        ease: transitionRef.current.ease,
        onComplete: () => {
          setTransitioning(false);
          lastEraRef.current = currentEra.id;
          transitionRef.current.animation = null;
        }
      });
    }
  }, [currentEra.id, initialized, cubes, count, currentEra.shape, currentEra.shapeScale]);
  
  // Ensure one project is always in focus
  useEffect(() => {
    // Find all project IDs for the current era
    const projectIds = cubes
      .filter(cube => cube.isProject && cube.eraId === currentEra.id)
      .map(cube => cube.projectId)
      .filter(id => id !== undefined) as string[];
    
    // Set default project if none is currently hovered
    if (projectIds.length > 0) {
      const defaultProject = projectIds[0];
      defaultProjectRef.current = defaultProject;
      
      // If no project is hovered, set the default one
      if (!hoveredProject) {
        setHoveredProject(defaultProject);
      } 
      // If the hovered project isn't for this era, update it
      else if (getEraForProject(hoveredProject) !== currentEra.id) {
        setHoveredProject(defaultProject);
      }
    }
  }, [cubes, hoveredProject, setHoveredProject, currentEra.id, getEraForProject]);
  
  // Handle mouse movement for project hovering
  const handlePointerMove = useCallback((event: MouseEvent) => {
    // Calculate pointer position in normalized device coordinates
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, [pointer]);

  // Set up event listeners for pointer movement
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerMove]);

  // Apply different materials for project and regular cubes
  const regularMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: currentEra.cubeColor,
      roughness: 0.3,
      metalness: 0.5,
      emissive: currentEra.cubeColor,
      emissiveIntensity: 0.4,
    });
  }, [currentEra.cubeColor]);

  // Animation frame handler
  useFrame((state, delta) => {
    if (!initialized) return;
    
    const mesh = instancedMeshRef.current;
    if (!mesh) return;
    
    // Update our clock reference with the current time
    clockRef.current.elapsedTime = state.clock.elapsedTime;
    
    const time = state.clock.elapsedTime;
    const tempObject = new THREE.Object3D();
    
    // Check for hovered projects with simpler detection
    raycaster.setFromCamera(pointer, state.camera);
    
    // Test against the main instancedMesh first (regular particles)
    const instanceIntersects = raycaster.intersectObject(mesh);
    
    let foundProjectIntersection = false;
    let nearestProjectId: string | null = null;
    
    // Separately test against each project cube's hover area
    for (const instance of projectInstances.current) {
      if (instance.meshRef.current) {
        const intersects = raycaster.intersectObject(instance.meshRef.current);
        // Only consider projects from the current era
        if (intersects.length > 0 && instance.project && instance.cube.eraId === currentEra.id) {
          // If this intersection is closer than any previous one
          if (!foundProjectIntersection || 
              intersects[0].distance < (instanceIntersects.length > 0 ? instanceIntersects[0].distance : Infinity)) {
            foundProjectIntersection = true;
            nearestProjectId = instance.project.id;
          }
        }
      }
    }
    
    // Update the hovered project if changed
    if (nearestProjectId !== lastHoveredRef.current) {
      lastHoveredRef.current = nearestProjectId;
      if (nearestProjectId) {
        // Found a hovered project
        setHoveredProject(nearestProjectId);
      } else if (defaultProjectRef.current) {
        // No project hovered, use the default
        setHoveredProject(defaultProjectRef.current);
      }
    }
    
    cubes.forEach((cube, i) => {
      const { position, initialPosition, targetPosition, baseScale, rotation, index, isProject, projectId, eraId } = cube;
      
      // If transitioning, create fluid motion paths
      if (transitioning) {
        const t = transitionRef.current.progress;
        
        // Create a unique path offset for each particle based on its index
        // Project cubes should start moving earlier and finish later for emphasis
        const particleOffset = isProject 
          ? 0 // No delay for project cubes
          : (index % 1000) / 1000 * 0.6; // Other particles have staggered delay
        
        // Individual particle progress - clamped between 0-1
        // Projects move with a different timing curve
        let particleProgress = Math.max(0, Math.min(1, (t * 1.5 - particleOffset)));
        
        // Enhanced easing functions
        // Use different easing for projects versus regular particles
        // Projects belonging to the target era should have special animation
        const isTargetEraProject = isProject && eraId === currentEra.id;
        
        const ease = isTargetEraProject
          ? easeOutElastic(particleProgress) // Bouncy finish for target era projects
          : isProject
            ? smootherStep(particleProgress * 1.2) // Faster but smooth for other projects
            : smootherStep(particleProgress); // Smooth motion for regular particles
        
        // Calculate distance for trajectory planning
        const distance = initialPosition.distanceTo(targetPosition);
        
        // Determine trajectory complexity based on distance and particle type
        // Project cubes get more complex, interesting paths
        const controlPointsCount = (isProject || distance > 5) ? 3 : 2;
        
        if (controlPointsCount <= 2) {
          // For shorter distances: quadratic Bezier (simpler curve)
          // Create a control point that varies by particle index for diversity
          const midX = (initialPosition.x + targetPosition.x) / 2 + Math.sin(index * 0.01) * distance * 0.2;
          const midY = (initialPosition.y + targetPosition.y) / 2 + Math.cos(index * 0.01) * distance * 0.3;
          const midZ = (initialPosition.z + targetPosition.z) / 2 + Math.sin(index * 0.02) * distance * 0.2;
          
          // Quadratic Bezier interpolation: smoother than linear
          const t1 = 1 - ease;
          position.x = initialPosition.x * t1 * t1 + midX * 2 * t1 * ease + targetPosition.x * ease * ease;
          position.y = initialPosition.y * t1 * t1 + midY * 2 * t1 * ease + targetPosition.y * ease * ease;
          position.z = initialPosition.z * t1 * t1 + midZ * 2 * t1 * ease + targetPosition.z * ease * ease;
        } else {
          // For longer distances: cubic Bezier (more complex curve)
          // Create intermediate control points for more complex path
          const controlPoint1 = new THREE.Vector3(
            initialPosition.x + (targetPosition.x - initialPosition.x) * 0.25 + Math.sin(index * 0.03) * distance * 0.2,
            initialPosition.y + (targetPosition.y - initialPosition.y) * 0.1 + Math.cos(index * 0.04) * distance * 0.4,
            initialPosition.z + (targetPosition.z - initialPosition.z) * 0.25 + Math.sin(index * 0.05) * distance * 0.2
          );
          
          const controlPoint2 = new THREE.Vector3(
            initialPosition.x + (targetPosition.x - initialPosition.x) * 0.75 + Math.cos(index * 0.06) * distance * 0.2,
            initialPosition.y + (targetPosition.y - initialPosition.y) * 0.9 + Math.sin(index * 0.07) * distance * 0.4,
            initialPosition.z + (targetPosition.z - initialPosition.z) * 0.75 + Math.cos(index * 0.08) * distance * 0.2
          );
          
          // Cubic Bezier interpolation for more natural curves
          const t1 = 1 - ease;
          const t2 = t1 * t1;
          const t3 = t1 * t1 * t1;
          const e2 = ease * ease;
          const e3 = ease * ease * ease;
          
          position.x = initialPosition.x * t3 + 
                      3 * controlPoint1.x * t2 * ease + 
                      3 * controlPoint2.x * t1 * e2 + 
                      targetPosition.x * e3;
                      
          position.y = initialPosition.y * t3 + 
                      3 * controlPoint1.y * t2 * ease + 
                      3 * controlPoint2.y * t1 * e2 + 
                      targetPosition.y * e3;
                      
          position.z = initialPosition.z * t3 + 
                      3 * controlPoint1.z * t2 * ease + 
                      3 * controlPoint2.z * t1 * e2 + 
                      targetPosition.z * e3;
        }
        
        // Add swarm-like collective movement
        // More pronounced for regular particles, subtle for project cubes
        const swarmGroup = index % 5; // Create 5 swarm groups
        const swarmPhase = (swarmGroup / 5) * Math.PI * 2;
        const swarmTime = time * 2 + swarmPhase;
        const swarmFactor = isProject 
          ? 0.05 * Math.min(1.0, particleProgress * (1 - particleProgress) * 4) // Subtle for projects
          : 0.15 * Math.min(1.0, particleProgress * (1 - particleProgress) * 4); // More for regular particles
        
        position.x += Math.sin(swarmTime) * swarmFactor * Math.sin(index * 0.1);
        position.y += Math.cos(swarmTime) * swarmFactor * Math.cos(index * 0.1);
        position.z += Math.sin(swarmTime * 0.7) * swarmFactor * Math.sin(index * 0.1);
        
        // Add a very subtle trail effect where particles leave a trace of their path
        // This is achieved by slightly varying the timing of nearby particles
        const trailEffect = (index % 10) / 10 * 0.05; // Small offset for adjacent particles
        position.x += (targetPosition.x - initialPosition.x) * trailEffect;
        position.y += (targetPosition.y - initialPosition.y) * trailEffect;
        position.z += (targetPosition.z - initialPosition.z) * trailEffect;
      }
      
      // Apply noise to position for organic movement
      const noiseValue = noise(
        position.x * 0.2, 
        position.y * 0.2, 
        position.z * 0.2, 
        time, 
        currentEra.noiseFactor,
        currentEra.noiseSpeed
      );
      
      // Add gentle pulsing effect based on time
      const pulseScale = baseScale * (1 + Math.sin(time * 0.5 + index * 0.05) * 0.05);
      
      // During transition, add extra scale animation - particles shrink slightly mid-transition
      const transitionScale = transitioning
        ? baseScale * (1 - 0.1 * Math.sin(Math.PI * transitionRef.current.progress))
        : baseScale;
      
      // Compute final position with noise
      const finalX = position.x;
      const finalY = position.y + noiseValue * (isProject ? 0.3 : 0.8); // Less noise for project cubes
      const finalZ = position.z;
      
      // Set position 
      tempObject.position.set(finalX, finalY, finalZ);
      
      // Determine if this project cube belongs to the current era
      const isCurrentEraProject = isProject && eraId === currentEra.id;
      
      // If this is a project cube, check if it's currently hovered
      const isHovered = isProject && projectId === hoveredProject;
      
      // Apply special effects for project cubes
      if (isProject) {
        // Make project cubes larger and even larger when hovered
        // Projects from current era are even larger
        const projectScale = isCurrentEraProject 
          ? (isHovered ? 2.0 : 1.7) // Current era projects are larger
          : (isHovered ? 1.4 : 1.2); // Other era projects are less prominent
          
        const hoverPulse = isHovered ? Math.sin(time * 4) * 0.1 + 1 : 1; // Pulse when hovered
        
        tempObject.scale.set(
          pulseScale * transitionScale * size * projectScale * hoverPulse,
          pulseScale * transitionScale * size * projectScale * hoverPulse,
          pulseScale * transitionScale * size * projectScale * hoverPulse
        );
        
        // Add more dramatic rotation for project cubes
        tempObject.rotation.set(
          rotation.x + delta * 0.3,
          rotation.y + delta * 0.4,
          rotation.z + delta * 0.2
        );
      } else {
        // Regular cubes
        tempObject.scale.set(
          pulseScale * transitionScale * size, 
          pulseScale * transitionScale * size, 
          pulseScale * transitionScale * size
        );
        
        // Set rotation with varied speed
        tempObject.rotation.set(
          rotation.x + delta * 0.1,
          rotation.y + delta * (0.1 + (index % 3) * 0.02),
          rotation.z + delta * 0.1
        );
      }
      
      // Add extra rotation during transitions
      if (transitioning) {
        const rotationBoost = Math.sin(transitionRef.current.progress * Math.PI);
        tempObject.rotation.x += rotationBoost * delta * 1.0;
        tempObject.rotation.y += rotationBoost * delta * 0.8;
      }
      
      // Update the matrix
      tempObject.updateMatrix();
      
      // Set the matrix of the instance
      mesh.setMatrixAt(i, tempObject.matrix);
    });
    
    // Update the instance
    mesh.instanceMatrix.needsUpdate = true;
  });

  // Custom easing functions
  const smootherStep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
  
  // Elastic easing for bouncy effect on project cubes
  const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  // Render project cube instances
  const renderProjectCubes = useMemo(() => {
    // Reset project instances array
    projectInstances.current = [];
    
    // Create a new instance for each project cube
    return cubes.filter(cube => cube.isProject).map(cube => {
      const meshRef = React.createRef<THREE.Mesh>();
      const hoverMeshRef = React.createRef<THREE.Mesh>();
      const glowRef = React.createRef<THREE.Mesh>();
      const project = getProjectByIndex(cube.index);
      
      if (!project) return null;
      
      // Store in the instances array
      projectInstances.current.push({
        cube,
        meshRef,
        project
      });
      
      // Determine if this project belongs to the current era
      const isCurrentEraProject = cube.eraId === currentEra.id;
      
      // Scale factor - current era projects are larger
      const isHovered = hoveredProject === project.id;
      
      // Adjust scale based on whether this project belongs to the current era
      const scaleMultiplier = isCurrentEraProject
        ? (isHovered ? 2.2 : 1.8) // Current era projects
        : (isHovered ? 1.4 : 1.2); // Other projects are smaller
      
      // Create material with the project's color
      const material = new THREE.MeshStandardMaterial({
        color: project.colorScheme.cube,
        roughness: 0.2,
        metalness: 0.8,
        emissive: project.colorScheme.cube,
        emissiveIntensity: isHovered ? 1.0 : 0.6, // Brighter when hovered
      });
      
      // Create a glow material
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: project.colorScheme.cube,
        transparent: true,
        opacity: isHovered ? 0.4 : 0.0, // Only visible when hovered
        side: THREE.BackSide,
      });
      
      // Only show labels for current era projects
      const showLabel = isHovered && isCurrentEraProject;
      
      return (
        <group key={`project-${cube.index}`}>
          {/* Much larger invisible hover detection area (6x larger than the cube) */}
          <mesh
            ref={hoverMeshRef}
            position={[cube.position.x, cube.position.y, cube.position.z]}
            scale={[size * cube.scale * 6, size * cube.scale * 6, size * cube.scale * 6]}
            visible={false}
            onClick={() => project.id && setHoveredProject(project.id)}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          
          {/* Outer glow effect that appears on hover */}
          <mesh
            ref={glowRef}
            position={[cube.position.x, cube.position.y, cube.position.z]}
            scale={[
              size * cube.scale * scaleMultiplier * 1.4, 
              size * cube.scale * scaleMultiplier * 1.4, 
              size * cube.scale * scaleMultiplier * 1.4
            ]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
          
          {/* Visible cube with pulsing effect */}
          <mesh
            ref={meshRef}
            position={[cube.position.x, cube.position.y, cube.position.z]}
            scale={[
              size * cube.scale * scaleMultiplier * (isHovered ? (1 + Math.sin(clockRef.current.elapsedTime * 4) * 0.1) : 1),
              size * cube.scale * scaleMultiplier * (isHovered ? (1 + Math.sin(clockRef.current.elapsedTime * 4) * 0.1) : 1),
              size * cube.scale * scaleMultiplier * (isHovered ? (1 + Math.sin(clockRef.current.elapsedTime * 4) * 0.1) : 1)
            ]}
            rotation={[
              cube.rotation.x + (isHovered ? clockRef.current.elapsedTime * 0.2 : 0),
              cube.rotation.y + (isHovered ? clockRef.current.elapsedTime * 0.3 : 0),
              cube.rotation.z + (isHovered ? clockRef.current.elapsedTime * 0.1 : 0)
            ]}
            onClick={() => project.id && setSelectedProject(project.id)}
          >
            <boxGeometry args={[1, 1, 1]} />
            <primitive object={material} attach="material" />
          </mesh>
          
          {/* Label that appears when hovering - only for current era projects */}
          {showLabel && (
            <Html
              position={[cube.position.x, cube.position.y + (size * cube.scale * 2), cube.position.z]}
              center
              distanceFactor={15}
            >
              <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                {project.title}
              </div>
            </Html>
          )}
        </group>
      );
    });
  }, [cubes, size, hoveredProject, setHoveredProject, setSelectedProject, clockRef.current.elapsedTime, currentEra.id]);

  return (
    <group>
      {/* Regular cubes */}
      <Instances limit={count} castShadow receiveShadow ref={instancedMeshRef as any}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={regularMaterial} attach="material" />
        
        {cubes.map((cube, i) => {
          // Only render if not a project cube
          if (!cube.isProject) {
            return <Instance key={i} />;
          }
          return null;
        })}
      </Instances>
      
      {/* Project cubes - rendered as individual meshes for better hover detection */}
      {renderProjectCubes}
    </group>
  );
} 