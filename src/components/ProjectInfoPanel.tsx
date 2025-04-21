/**
 * ProjectInfoPanel Component
 * 
 * This component displays information about a project when it's hovered or selected.
 * It shows both the project details and a personal reflection section.
 * 
 * Features:
 * - Styled panels for project information
 * - Dynamic content based on the project ID
 * - Smooth fade in/out animations
 * - Responsive layout
 * 
 * The component is shown outside the 3D canvas in the main page layout
 * and responds to hover events from the 3D project cubes.
 */

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { mockProjects, Project } from './ProjectCarousel';

// Types
interface ProjectInfoPanelProps {
  projectId: string;
}

const ProjectInfoPanel: React.FC<ProjectInfoPanelProps> = ({ projectId }) => {
  const { selectedProject } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if this is the selected project
  const isSelected = selectedProject === projectId;
  
  // Load project data when projectId changes
  useEffect(() => {
    if (projectId) {
      const foundProject = mockProjects.find((p: Project) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        // Delay visibility for animation
        setTimeout(() => setIsVisible(true), 50);
      }
    } else {
      setIsVisible(false);
      // Delay removing project data to allow fade out animation
      setTimeout(() => setProject(null), 300);
    }
  }, [projectId]);
  
  if (!project) return null;
  
  // CSS classes for animations
  const panelBaseClasses = `p-6 rounded-lg transition-all duration-300 ease-in-out transform w-96 max-w-sm`;
  
  const leftPanelClasses = `${panelBaseClasses} ${
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
  } ${isSelected ? 'ring-2' : ''}`;
  
  const rightPanelClasses = `${panelBaseClasses} ${
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
  } ${isSelected ? 'ring-2' : ''}`;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-between px-8">
      {/* Left Panel - Personal Reflection */}
      <div 
        className={leftPanelClasses}
        style={{
          backgroundColor: `${project.colorScheme.background}`,
          color: project.colorScheme.primaryText,
          borderColor: project.colorScheme.border
        }}
      >
        <h2 className="text-xl font-bold mb-3 border-b pb-2"
            style={{ borderColor: project.colorScheme.border }}>
          Personal Reflection
        </h2>
        <p className="text-sm leading-relaxed">{project.reflection}</p>
        
        <div className="mt-4 opacity-80 text-xs" style={{ color: project.colorScheme.primaryText }}>
          Project {project.id.split('-')[1]} Reflection
        </div>
      </div>
      
      {/* Right Panel - Project Info */}
      <div 
        className={rightPanelClasses}
        style={{
          backgroundColor: `${project.colorScheme.background}`,
          color: project.colorScheme.primaryText,
          borderColor: project.colorScheme.border
        }}
      >
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
               style={{ backgroundColor: project.colorScheme.accent }}>
          </div>
          <h2 className="text-xl font-bold">{project.title}</h2>
        </div>
        
        <div className="mb-4 pb-3 border-b" 
             style={{ borderColor: project.colorScheme.border }}>
          <p className="text-sm font-medium mb-1">{project.shortDesc}</p>
          <p className="text-sm leading-relaxed">{project.description}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech: string, index: number) => (
              <span 
                key={index} 
                className="px-2 py-1 rounded text-xs"
                style={{ 
                  backgroundColor: `${project.colorScheme.accent}30`,
                  color: project.colorScheme.primaryText
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        <div 
          className="text-xs mt-4 opacity-80 pb-1 border-b" 
          style={{ borderColor: project.colorScheme.border }}
        >
          {isSelected 
            ? "Selected project - click elsewhere to deselect" 
            : "Click to view more details"}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoPanel; 