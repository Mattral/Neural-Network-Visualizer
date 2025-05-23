
import { TrainingData } from '@/types/neural-network';

// XOR dataset
export const XOR_DATA: TrainingData = {
  inputs: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
  ],
  outputs: [
    [0],
    [1],
    [1],
    [0]
  ]
};

// Circle dataset - points inside or outside a circle
export const CIRCLE_DATA: TrainingData = {
  inputs: [],
  outputs: []
};

// Generate circle data - points inside a circle are 1, outside are 0
(() => {
  const numPoints = 100;
  const radius = 0.5;
  const centerX = 0.5;
  const centerY = 0.5;

  for (let i = 0; i < numPoints; i++) {
    // Generate random points in the unit square
    const x = Math.random();
    const y = Math.random();
    
    // Calculate distance from center
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Inside circle = 1, outside = 0
    const isInside = distance < radius ? 1 : 0;
    
    CIRCLE_DATA.inputs.push([x, y]);
    CIRCLE_DATA.outputs.push([isInside]);
  }
})();

// Spiral dataset - two intertwined spirals
export const SPIRAL_DATA: TrainingData = {
  inputs: [],
  outputs: []
};

// Generate spiral data
(() => {
  const numPoints = 100;
  const turns = 2;
  
  // Generate points for the first spiral (class 0)
  for (let i = 0; i < numPoints / 2; i++) {
    const r = i / (numPoints / 2) * 0.8 + 0.1; // radius from 0.1 to 0.9
    const theta = i / (numPoints / 2) * turns * Math.PI * 2; // angle
    
    const x = 0.5 + r * Math.cos(theta) * 0.5;
    const y = 0.5 + r * Math.sin(theta) * 0.5;
    
    SPIRAL_DATA.inputs.push([x, y]);
    SPIRAL_DATA.outputs.push([0]);
  }
  
  // Generate points for the second spiral (class 1)
  for (let i = 0; i < numPoints / 2; i++) {
    const r = i / (numPoints / 2) * 0.8 + 0.1; // radius from 0.1 to 0.9
    const theta = i / (numPoints / 2) * turns * Math.PI * 2 + Math.PI; // angle offset by π
    
    const x = 0.5 + r * Math.cos(theta) * 0.5;
    const y = 0.5 + r * Math.sin(theta) * 0.5;
    
    SPIRAL_DATA.inputs.push([x, y]);
    SPIRAL_DATA.outputs.push([1]);
  }
})();
