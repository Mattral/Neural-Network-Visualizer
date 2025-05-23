
export type ActivationFunction = 'linear' | 'sigmoid' | 'relu' | 'tanh';
export type LayerType = 'input' | 'hidden' | 'output';

export interface LayerConfig {
  neurons: number;
  activation: ActivationFunction;
  type: LayerType;
}

export interface NeuronData {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  x: number;
  y: number;
  activation: number;
  activationFunction?: ActivationFunction;
  layerType?: LayerType;
}

export interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  source?: NeuronData;
  target?: NeuronData;
}

export interface NetworkData {
  neurons: NeuronData[];
  connections: ConnectionData[];
}

export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}

export interface TrainingMetrics {
  loss: number;
  accuracy: number;
}

export type DatasetType = 'xor' | 'circle' | 'spiral' | 'linear' | 'sine';
