/**
 * Project Store
 * 
 * This Zustand store manages state related to project interactions.
 * It keeps track of which project is currently hovered or selected,
 * and manages the association between projects and companies/eras.
 * 
 * Features:
 * - Stores hover and selection state for projects
 * - Provides methods to update the hover/selection state
 * - Maps projects to their associated companies/eras
 * - Handles navigation between projects and companies
 * - Communicates between different components (CubeField, ProjectInfoPanel, TimelineControl)
 */

import { create } from 'zustand';
import { mockProjects } from '../components/ProjectCarousel';
import { useEraStore } from './eraStore';

// Project to Era mapping
const projectToEraMap: Record<string, string> = {
  // Grad School projects (2 projects)
  'project-1009': 'grad-school',
  'project-1010': 'grad-school',
  
  // Apple projects (1 project)
  'project-2013': 'apple',
  'project-2014': 'apple',
  
  // IBM projects (2 projects)
  'project-3019': 'ibm',
  'project-3020': 'ibm',
  
  // Microsoft projects (2 projects)
  'project-4021': 'microsoft', 
  'project-4022': 'microsoft',
  
  // Meta projects (1 project)
  'project-5031': 'meta',
  
  // Sleeping Ox projects (3 projects)
  'project-6033': 'sleeping-ox',
  'project-6034': 'sleeping-ox',
  'project-6035': 'sleeping-ox',
  
  // Current projects (1 project)
  'project-7039': 'now'
};

// Era to Project mapping (reverse of above)
const eraToProjectsMap: Record<string, string[]> = {};

// Initialize the era to projects map
Object.entries(projectToEraMap).forEach(([projectId, eraId]) => {
  if (!eraToProjectsMap[eraId]) {
    eraToProjectsMap[eraId] = [];
  }
  eraToProjectsMap[eraId].push(projectId);
});

// Define types
type ProjectState = {
  hoveredProject: string | null;
  selectedProject: string | null;
  setHoveredProject: (id: string | null) => void;
  setSelectedProject: (id: string | null) => void;
  getEraForProject: (projectId: string) => string | null;
  getProjectsForEra: (eraId: string) => string[];
  syncProjectWithEra: (eraId: string) => void;
};

// Create store
export const useProjectStore = create<ProjectState>((set, get) => ({
  hoveredProject: null,
  selectedProject: null,
  
  setHoveredProject: (id: string | null) => {
    set({ hoveredProject: id });
    
    // When hovering over a project, update the era/company if needed
    if (id) {
      const eraId = get().getEraForProject(id);
      if (eraId) {
        // Only update era if it's different from current
        const currentEra = useEraStore.getState().currentEra;
        if (currentEra.id !== eraId) {
          useEraStore.getState().setCurrentEraById(eraId);
        }
      }
    }
  },
  
  setSelectedProject: (id: string | null) => {
    set({ selectedProject: id });
    
    // When selecting a project, always update the era/company
    if (id) {
      const eraId = get().getEraForProject(id);
      if (eraId) {
        useEraStore.getState().setCurrentEraById(eraId);
      }
    }
  },
  
  // Get the era/company for a given project
  getEraForProject: (projectId: string) => {
    return projectToEraMap[projectId] || null;
  },
  
  // Get all projects for a given era/company
  getProjectsForEra: (eraId: string) => {
    return eraToProjectsMap[eraId] || [];
  },
  
  // Sync project selection with current era
  syncProjectWithEra: (eraId: string) => {
    const projects = get().getProjectsForEra(eraId);
    if (projects.length > 0) {
      // Choose the first project for this era
      const projectId = projects[0];
      set({ 
        hoveredProject: projectId,
        selectedProject: projectId
      });
    }
  }
})); 