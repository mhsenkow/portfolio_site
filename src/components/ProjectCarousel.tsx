/**
 * ProjectCarousel Component
 * 
 * This component displays a carousel of projects at the sides of the screen
 * that users can navigate through. It highlights the current project and allows
 * interaction with the project cubes.
 * 
 * Features:
 * - Displays project thumbnails in a carousel layout
 * - Highlights the currently focused project
 * - Provides navigation controls
 * - Syncs with the 3D cube interactions
 * - Supports keyboard navigation (left/right arrows)
 */

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useEraStore } from '../store/eraStore';

// Color palette with accessible contrast ratios
// Each entry has: dark text color, light background, border color
export type ColorScheme = {
  primaryText: string;   // Dark text for contrast
  background: string;    // Light background
  border: string;        // Border color (medium tone)
  accent: string;        // Accent color for highlights
  cube: string;          // Bright color for the 3D cube
};

// Pre-defined color schemes for projects
const colorSchemes: ColorScheme[] = [
  {
    primaryText: '#12395D',
    background: '#EBF5FF', 
    border: '#5EAEFF',
    accent: '#0081FF',
    cube: '#0081FF'
  },
  {
    primaryText: '#45294C',
    background: '#F9EBFF',
    border: '#C77DDB',
    accent: '#9B59B6',
    cube: '#9B59B6'
  },
  {
    primaryText: '#2D5036',
    background: '#EAFFEF',
    border: '#74D99F',
    accent: '#2ECC71',
    cube: '#2ECC71'
  },
  {
    primaryText: '#7D3B00',
    background: '#FFF5EB',
    border: '#FFB370',
    accent: '#FF9D42',
    cube: '#FF9500'
  },
  {
    primaryText: '#7D001F',
    background: '#FFEBF0',
    border: '#FF7DA3',
    accent: '#FF5077',
    cube: '#FF0055'
  },
  {
    primaryText: '#7B6900',
    background: '#FFFCE8',
    border: '#FFF06A',
    accent: '#FFE500',
    cube: '#FFE500'
  },
  {
    primaryText: '#00416A',
    background: '#E8F7FF',
    border: '#5AC8FF',
    accent: '#10A5F5',
    cube: '#10A5F5'
  }
];

// Project type definition
export type Project = {
  id: string;
  title: string;
  shortDesc: string;
  description: string;
  technologies: string[];
  reflection: string;
  colorScheme: ColorScheme;
};

// Mock project data - would come from an API in production
export const mockProjects: Project[] = [
  // Grad School Projects
  {
    id: "project-1009",
    title: "Neural Interface",
    shortDesc: "Brain-computer interface for intuitive control systems",
    description: "A neural interface that allows users to control devices with their thoughts. Using advanced ML algorithms to interpret neural signals with unprecedented accuracy.",
    technologies: ['TensorFlow', 'Neural Networks', 'C++', 'CUDA'],
    reflection: "This project pushed the boundaries of how humans interact with technology. Working with neurologists taught me how the brain processes intent, and translating that into code was a fascinating journey.",
    colorScheme: colorSchemes[0]
  },
  {
    id: "project-1010",
    title: "Cognitive Mapping",
    shortDesc: "Spatial memory visualization for complex information",
    description: "A system that helps users build mental models of complex information by creating spatial memory maps. Uses augmented reality to create persistent spatial anchors.",
    technologies: ['Unity', 'C#', 'ARKit', 'Cognitive Science'],
    reflection: "The intersection of cognitive science and spatial computing opened a new dimension for information retrieval. Our brains are wired for spatial navigation; leveraging this for information organization feels like unlocking a hidden superpower.",
    colorScheme: colorSchemes[0]
  },
  
  // Apple Projects
  {
    id: "project-2013",
    title: "Quantum Compiler",
    shortDesc: "Optimization tool for quantum computing circuits",
    description: "A compiler designed specifically for quantum computing architectures. Optimizes quantum circuits to reduce decoherence and gate errors.",
    technologies: ['Q#', 'Python', 'Linear Algebra', 'Quantum Computing'],
    reflection: "Quantum computing represents a paradigm shift in how we process information. The mathematical beauty underlying quantum algorithms sparked my interest in theoretical computer science.",
    colorScheme: colorSchemes[1]
  },
  {
    id: "project-2014",
    title: "Accessibility Framework",
    shortDesc: "Universal design system for inclusive interfaces",
    description: "A comprehensive framework for building applications with accessibility as a first-class feature. Includes VoiceOver integration, haptic feedback, and dynamic content adaptation.",
    technologies: ['Swift', 'UIKit', 'VoiceOver API', 'Haptics'],
    reflection: "Building technology that works for everyone shouldn't be an afterthought. This project taught me that accessibility isn't just about compliance—it's about creating fundamentally better experiences for all users.",
    colorScheme: colorSchemes[1]
  },
  
  // IBM Projects
  {
    id: "project-3019",
    title: "Holographic UI",
    shortDesc: "Spatial interface for augmented reality environments",
    description: "A holographic user interface framework that enables intuitive spatial interactions in AR/VR environments. Supports gesture recognition and haptic feedback.",
    technologies: ['Unity', 'C#', 'OpenXR', 'Computer Vision'],
    reflection: "Designing for three-dimensional space forced me to rethink every UI assumption I had. Spatial computing remains one of the most exciting frontiers in human-computer interaction.",
    colorScheme: colorSchemes[2]
  },
  {
    id: "project-3020",
    title: "Watson Analytics",
    shortDesc: "Enterprise intelligence dashboard for business insights",
    description: "A dashboard integrating Watson AI capabilities to provide actionable insights from enterprise data. Features automated trend detection and anomaly identification.",
    technologies: ['React', 'D3.js', 'Watson API', 'Node.js'],
    reflection: "Building AI systems that business users could understand and trust required transparent design. The challenge wasn't just in the algorithms, but in creating interactions that made AI decisions interpretable.",
    colorScheme: colorSchemes[2]
  },
  
  // Microsoft Projects
  {
    id: "project-4021",
    title: "Sustainable Grid",
    shortDesc: "AI-powered smart grid management system",
    description: "An intelligent grid management system that optimizes energy distribution based on real-time demand, renewable availability, and predictive analytics.",
    technologies: ['Python', 'TensorFlow', 'IoT', 'Time Series Analysis'],
    reflection: "Energy is the foundation of modern civilization, yet our grid systems remain surprisingly dated. This project aligned my technical skills with my passion for sustainability.",
    colorScheme: colorSchemes[3]
  },
  {
    id: "project-4022",
    title: "Azure Pipelines",
    shortDesc: "Continuous integration platform for cloud applications",
    description: "A component of Azure DevOps that provides build and release services for applications deployed to the cloud. Supports containers, VMs, and serverless architectures.",
    technologies: ['TypeScript', 'Docker', 'Kubernetes', 'YAML'],
    reflection: "The challenge of creating infrastructure that could handle the diversity of modern application architectures taught me the value of abstraction. We created a system flexible enough to support virtually any deployment pattern.",
    colorScheme: colorSchemes[3]
  },
  
  // Meta Projects
  {
    id: "project-5031",
    title: "Biosynth Framework",
    shortDesc: "Software for designing synthetic biological systems",
    description: "A computational framework for designing and simulating synthetic biological circuits. Enables rapid prototyping of genetic constructs with predictable behavior.",
    technologies: ['PyTorch', 'Bioinformatics', 'Genetic Algorithms', 'Systems Biology'],
    reflection: "The intersection of computer science and biology represents a frontier with limitless potential. Learning to model biological systems computationally gave me a deeper appreciation for nature's programming language.",
    colorScheme: colorSchemes[4]
  },
  
  // Sleeping Ox Projects
  {
    id: "project-6033",
    title: "Autonomous Swarm",
    shortDesc: "Distributed intelligence for robot collectives",
    description: "A swarm intelligence platform enabling coordination among hundreds of simple robots to accomplish complex tasks through emergent behavior.",
    technologies: ['ROS', 'Distributed Systems', 'C++', 'Swarm Algorithms'],
    reflection: "Simple rules can create incredibly complex behaviors when applied across many agents. This project taught me about resilience through redundancy and the power of decentralized systems.",
    colorScheme: colorSchemes[5]
  },
  {
    id: "project-6034",
    title: "Ethical AI Framework",
    shortDesc: "Governance system for responsible artificial intelligence",
    description: "A comprehensive framework for integrating ethical considerations into AI development pipelines. Includes fairness metrics, model explainability, and bias detection tools.",
    technologies: ['Python', 'Fairness Indicators', 'TensorFlow', 'Policy'],
    reflection: "Building AI responsibly requires more than just technical fixes—it demands a holistic approach integrating ethics throughout the development process. This work bridged my technical expertise with my interest in responsible innovation.",
    colorScheme: colorSchemes[5]
  },
  {
    id: "project-6035",
    title: "Decision Support System",
    shortDesc: "Hybrid intelligence for complex decision making",
    description: "A human-AI collaborative system designed to support decision-making in complex, high-stakes environments. Combines expert knowledge with machine learning.",
    technologies: ['React', 'Node.js', 'GPT-4', 'Decision Theory'],
    reflection: "The most powerful AI systems aren't fully autonomous—they're designed to enhance human capabilities, not replace them. This project explored how to create symbiotic relationships between human experts and AI systems.",
    colorScheme: colorSchemes[5]
  },
  
  // Current Projects
  {
    id: "project-7039",
    title: "Climate Model",
    shortDesc: "High-resolution earth system simulation",
    description: "A high-resolution climate simulation incorporating atmospheric, oceanic, and land surface processes to predict climate patterns with unprecedented granularity.",
    technologies: ['CUDA', 'Fortran', 'Parallel Computing', 'Fluid Dynamics'],
    reflection: "Climate modeling sits at the intersection of nearly every scientific discipline. Working with atmospheric scientists expanded my perspective on computational challenges and the importance of optimization.",
    colorScheme: colorSchemes[6]
  }
];

const ProjectCarousel: React.FC = () => {
  const { hoveredProject, selectedProject, setHoveredProject, setSelectedProject, getProjectsForEra } = useProjectStore();
  const { currentEra } = useEraStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentEraProjects, setCurrentEraProjects] = useState<Project[]>([]);
  
  // Get projects for the current era
  useEffect(() => {
    const projectIds = getProjectsForEra(currentEra.id);
    const projects = mockProjects.filter(p => projectIds.includes(p.id));
    setCurrentEraProjects(projects);
    
    // Reset active index when era changes
    setActiveIndex(0);
  }, [currentEra.id, getProjectsForEra]);
  
  // Sync carousel with hovered/selected project
  useEffect(() => {
    if (hoveredProject) {
      const index = currentEraProjects.findIndex(p => p.id === hoveredProject);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [hoveredProject, currentEraProjects]);
  
  // Handle navigation
  const goToProject = (index: number) => {
    if (currentEraProjects.length === 0) return;
    
    const newIndex = Math.max(0, Math.min(index, currentEraProjects.length - 1));
    setActiveIndex(newIndex);
    setSelectedProject(currentEraProjects[newIndex].id);
    setHoveredProject(currentEraProjects[newIndex].id);
  };
  
  const goNext = () => goToProject(activeIndex + 1);
  const goPrev = () => goToProject(activeIndex - 1);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, currentEraProjects.length]); // Re-bind when activeIndex changes
  
  // If no projects for current era, don't render carousel
  if (currentEraProjects.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 flex items-center justify-center">
      <div className="flex items-center space-x-2 py-2">
        {/* Previous button */}
        <button 
          onClick={goPrev}
          disabled={activeIndex === 0}
          className="bg-black/40 text-white p-3 rounded-full disabled:opacity-30 hover:bg-black/60 transition-colors"
          aria-label="Previous project"
          title="Previous project (Left arrow key)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Project cards */}
        <div className="flex items-center relative h-20 overflow-visible">
          {currentEraProjects.map((project, index) => {
            // Calculate position: -2, -1, 0 (active), 1, 2
            const position = index - activeIndex;
            const isActive = position === 0;
            const isSelected = selectedProject === project.id;
            
            // Dynamic classes based on position
            const scale = isActive ? 'scale-100' : 'scale-80';
            const opacity = Math.abs(position) <= 1 ? 'opacity-100' : 'opacity-40';
            const translate = (() => {
              if (position < -1) return '-translate-x-48';
              if (position === -1) return '-translate-x-12';
              if (position === 0) return 'translate-x-0';
              if (position === 1) return 'translate-x-12';
              return 'translate-x-48';
            })();
            
            return (
              <div
                key={project.id}
                className={`project-card flex-shrink-0 rounded-full overflow-hidden shadow-lg 
                  cursor-pointer transition-all duration-300 transform ${scale} ${opacity} ${translate}
                  ${isActive ? 'ring-2' : ''} ${isSelected ? 'ring-2' : ''}`}
                style={{ 
                  backgroundColor: project.colorScheme.background,
                  borderColor: project.colorScheme.border,
                  boxShadow: isActive ? `0 0 15px ${project.colorScheme.accent}` : '',
                  zIndex: isActive ? 10 : 10 - Math.abs(position),
                  width: isActive ? '280px' : '220px',
                  height: isActive ? '56px' : '48px'
                }}
                onClick={() => goToProject(index)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => !selectedProject && setHoveredProject(null)}
              >
                <div className="h-full flex items-center justify-center px-4" 
                     style={{ color: project.colorScheme.primaryText }}>
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full flex-shrink-0" 
                         style={{ backgroundColor: project.colorScheme.accent }}>
                    </div>
                    <div className="w-full max-w-[215px]">
                      <div className="font-bold text-sm whitespace-normal">{project.title}</div>
                      {isActive && (
                        <div className="text-xs opacity-80 whitespace-normal overflow-hidden line-clamp-1">{project.shortDesc}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Next button */}
        <button 
          onClick={goNext}
          disabled={activeIndex === currentEraProjects.length - 1}
          className="bg-black/40 text-white p-3 rounded-full disabled:opacity-30 hover:bg-black/60 transition-colors"
          aria-label="Next project"
          title="Next project (Right arrow key)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectCarousel; 