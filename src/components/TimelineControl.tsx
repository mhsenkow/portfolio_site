/**
 * TimelineControl Component
 * 
 * This component renders the interactive timeline at the bottom of the screen,
 * allowing users to navigate through different eras of the portfolio.
 * 
 * Features:
 * - Buttons for direct navigation to specific eras
 * - Draggable slider control for scrubbing through the timeline
 * - Display of current era's year and narrative text
 * - Responsive layout that works on various screen sizes
 * 
 * The timeline triggers state changes in the eraStore which then cascade
 * to update the particle field and camera positions.
 */

import React, { useState, useEffect, useRef, ChangeEvent, CSSProperties } from 'react';
import { useEraStore, Era } from '../store/eraStore';
import { useProjectStore } from '../store/projectStore';
import { mockProjects } from '../components/ProjectCarousel';

export default function TimelineControl() {
  const { eras, currentEraIndex, setCurrentEraIndex } = useEraStore();
  const { syncProjectWithEra, getProjectsForEra } = useProjectStore();
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredEraIndex, setHoveredEraIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Handle timeline navigation
  const handleTimelineClick = (index: number) => {
    setCurrentEraIndex(index);
    // Sync the project selection with the new era
    syncProjectWithEra(eras[index].id);
  };
  
  // Handle slider interaction
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setCurrentEraIndex(value);
    // Sync the project selection with the new era
    syncProjectWithEra(eras[value].id);
  };
  
  // Handle slider drag
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add mouse up event listener to document
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Sync projects when era changes (useful for initial load or external era changes)
  useEffect(() => {
    syncProjectWithEra(eras[currentEraIndex].id);
  }, [currentEraIndex, eras, syncProjectWithEra]);
  
  // Get number of projects for each era
  const getProjectCount = (eraId: string) => {
    const projects = getProjectsForEra(eraId);
    return projects.length;
  };
  
  // Get project titles for an era
  const getProjectTitles = (eraId: string) => {
    const projectIds = getProjectsForEra(eraId);
    return projectIds.map(id => {
      const project = mockProjects.find(p => p.id === id);
      return project ? project.title : '';
    }).filter(title => title !== '');
  };

  // Current era's project titles
  const currentEraProjects = getProjectTitles(eras[currentEraIndex].id);
  
  return (
    <>
      {/* Era Information Placard - Fixed on the right side */}
      <div 
        className="fixed right-6 bottom-32 z-40 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-700 w-64"
        style={{ borderLeft: `4px solid ${eras[currentEraIndex].cubeColor}` }}
      >
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white">{eras[currentEraIndex].name}</h3>
            <span className="text-gray-300 text-sm">{eras[currentEraIndex].year}</span>
          </div>
          
          {/* Projects list */}
          <div className="mt-2 border-t border-gray-700 pt-2">
            <div className="text-xs text-gray-400 mb-1">Projects:</div>
            <ul className="text-xs text-white space-y-1">
              {currentEraProjects.map((title, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5 mt-1 flex-shrink-0"></span>
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    
      {/* Timeline Control - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md text-white p-3 h-20">
        <div className="container mx-auto flex justify-between items-center h-full">
          {/* Era name and year */}
          <div className="flex-shrink-0 w-36">
            <div className="text-xl font-bold">{eras[currentEraIndex].name}</div>
            <div className="text-gray-300 text-sm">{eras[currentEraIndex].year}</div>
            <div className="text-xs text-gray-400">
              {getProjectCount(eras[currentEraIndex].id)} project{getProjectCount(eras[currentEraIndex].id) !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Narrative text */}
          <div className="flex-grow px-4 hidden md:block text-center">
            <p className="text-sm md:text-base">{eras[currentEraIndex].narrative}</p>
          </div>
          
          {/* Timeline control */}
          <div className="flex-shrink-0 flex items-center space-x-2 w-1/2 md:w-1/3">
            {/* Visual timeline markers */}
            <div className="hidden md:flex items-center space-x-1 w-full relative">
              {eras.map((era, index) => (
                <div key={era.id} className="relative group">
                  <button
                    onClick={() => handleTimelineClick(index)}
                    onMouseEnter={() => setHoveredEraIndex(index)}
                    onMouseLeave={() => setHoveredEraIndex(null)}
                    className={`h-4 rounded-full transition-all duration-300 ${
                      index === currentEraIndex
                        ? 'bg-white w-8'
                        : 'bg-gray-500 w-4 hover:bg-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: index === currentEraIndex ? era.cubeColor : '', 
                      position: 'relative'
                    }}
                  >
                    {/* Number of projects indicator */}
                    {getProjectCount(era.id) > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 flex items-center justify-center 
                                 bg-white rounded-full text-[8px] font-bold w-3 h-3"
                        style={{ color: era.cubeColor }}
                      >
                        {getProjectCount(era.id)}
                      </span>
                    )}
                  </button>
                  
                  {/* Enhanced Tooltip with project list - only for hovered non-current era */}
                  {(hoveredEraIndex === index && currentEraIndex !== index) && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 
                                  px-3 py-2 rounded text-xs whitespace-nowrap z-10 min-w-[180px] max-w-[250px]">
                      <div className="font-bold text-sm">{era.name}</div>
                      <div className="text-gray-300 text-[10px] mb-1">{era.year}</div>
                      
                      {/* Project list */}
                      {getProjectCount(era.id) > 0 && (
                        <div className="mt-1 border-t border-gray-700 pt-1">
                          <div className="text-[10px] text-gray-400 mb-1">Projects:</div>
                          <ul className="text-[10px] text-white">
                            {getProjectTitles(era.id).map((title, i) => (
                              <li key={i} className="flex items-center mb-0.5 whitespace-normal">
                                <span className="w-1 h-1 rounded-full bg-gray-400 mr-1.5 flex-shrink-0"></span>
                                {title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2
                                    border-8 border-transparent border-t-black/90"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Era connection lines */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-600 -z-10 transform -translate-y-1/2"></div>
            </div>
            
            {/* Slider for mobile */}
            <div className="w-full md:hidden">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{eras[0].year.split('-')[0]}</span>
                <span>{eras[eras.length-1].year === 'Present' ? 'Now' : eras[eras.length-1].year.split('-')[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max={eras.length - 1}
                value={currentEraIndex}
                onChange={handleSliderChange}
                onMouseDown={handleMouseDown}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${eras.map((era, i) => 
                    `${i === 0 ? '' : ','} ${era.cubeColor} ${(i/(eras.length-1))*100}%, ${era.cubeColor} ${((i+1)/(eras.length))*100}%`
                  ).join('')})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 