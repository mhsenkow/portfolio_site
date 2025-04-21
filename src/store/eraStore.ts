/**
 * Era Store
 * 
 * This Zustand store manages the state related to timeline eras.
 * It's the central point for keeping track of which era is currently selected
 * and manages transitions between eras.
 * 
 * Features:
 * - Stores all era data from eras.json
 * - Tracks the current and previous era indexes
 * - Provides methods to update the current era by index or ID
 * - Type definitions for Era data structure
 * 
 * This store is consumed by the TimelineControl, CubeField, and CameraController
 * components to coordinate visual changes throughout the application.
 */

import { create } from 'zustand';
import eraData from '../data/eras.json';

export type Era = {
  id: string;
  name: string;
  year: string;
  cameraPos: [number, number, number];
  bgColor: string;
  fogDensity: number;
  cubeColor: string;
  noiseFactor: number;
  noiseSpeed: number;
  narrative: string;
  shape: string;
  shapeScale: number;
};

type EraState = {
  eras: Era[];
  currentEraIndex: number;
  currentEra: Era;
  previousEraIndex: number;
  setCurrentEraIndex: (index: number) => void;
  setCurrentEraById: (id: string) => void;
};

export const useEraStore = create<EraState>((set) => ({
  eras: eraData as Era[],
  currentEraIndex: 0,
  currentEra: (eraData as Era[])[0],
  previousEraIndex: 0,
  
  setCurrentEraIndex: (index: number) => {
    set((state) => {
      const clampedIndex = Math.min(Math.max(0, index), state.eras.length - 1);
      return {
        previousEraIndex: state.currentEraIndex,
        currentEraIndex: clampedIndex,
        currentEra: state.eras[clampedIndex],
      };
    });
  },
  
  setCurrentEraById: (id: string) => {
    set((state) => {
      const index = state.eras.findIndex((era) => era.id === id);
      if (index !== -1) {
        return {
          previousEraIndex: state.currentEraIndex,
          currentEraIndex: index,
          currentEra: state.eras[index],
        };
      }
      return state;
    });
  },
})); 