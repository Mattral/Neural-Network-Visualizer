
import * as tf from '@tensorflow/tfjs';
import { LayerConfig, TrainingData, TrainingMetrics } from '@/types/neural-network';
import { XOR_DATA, CIRCLE_DATA, SPIRAL_DATA } from './datasets';

export class NeuralNetworkModel {
  private model: tf.LayersModel | null = null;
  private config: LayerConfig[];
  private dataset: TrainingData = { inputs: [], outputs: [] };
  private inputTensor: tf.Tensor | null = null;
  private outputTensor: tf.Tensor | null = null;
  private activations: number[][] = [];
  private layerOutputs: tf.Tensor[] = [];

  constructor(config: LayerConfig[]) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Clear any existing models from memory
    if (this.model) {
      this.model.dispose();
    }

    // Create a sequential model
    const model = tf.sequential();

    // Add layers according to the configuration
    this.config.forEach((layerConfig, index) => {
      if (index === 0) {
        // Input layer
        model.add(tf.layers.dense({
          units: layerConfig.neurons,
          inputShape: [layerConfig.neurons],
          activation: layerConfig.activation as any,
        }));
      } else {
        // Hidden and output layers
        model.add(tf.layers.dense({
          units: layerConfig.neurons,
          activation: layerConfig.activation as any,
        }));
      }
    });

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });

    this.model = model;

    // Default to XOR dataset
    this.loadDataset('xor');
  }

  loadDataset(datasetName: string): void {
    switch (datasetName) {
      case 'xor':
        this.dataset = XOR_DATA;
        break;
      case 'circle':
        this.dataset = CIRCLE_DATA;
        break;
      case 'spiral':
        this.dataset = SPIRAL_DATA;
        break;
      default:
        this.dataset = XOR_DATA;
    }

    // Convert to tensors
    if (this.inputTensor) this.inputTensor.dispose();
    if (this.outputTensor) this.outputTensor.dispose();

    this.inputTensor = tf.tensor2d(this.dataset.inputs);
    this.outputTensor = tf.tensor2d(this.dataset.outputs);
  }

  async trainStep(): Promise<TrainingMetrics> {
    if (!this.model || !this.inputTensor || !this.outputTensor) {
      return { loss: 0, accuracy: 0 };
    }

    // Train for one step and get metrics
    const result = await this.model.trainOnBatch(this.inputTensor, this.outputTensor);
    
    // Get loss and accuracy from training result
    const loss = Array.isArray(result) ? result[0] : result;
    const accuracy = Array.isArray(result) && result.length > 1 ? result[1] : 0;

    // Update activations after training
    this.updateActivations();

    return { loss: loss as number, accuracy };
  }

  async updateActivations(): Promise<void> {
    if (!this.model || !this.inputTensor) return;

    try {
      // Create a model that outputs all layer activations
      const layerOutputs: tf.Tensor[] = [];
      
      // We need to use tf.tidy to clean up tensors after calculation
      tf.tidy(() => {
        // Feed sample input through each layer and collect activations
        let layerInput = this.inputTensor;
        
        for (let i = 0; i < this.model!.layers.length; i++) {
          const layer = this.model!.layers[i];
          const layerOutput = layer.apply(layerInput) as tf.Tensor;
          layerOutputs.push(layerOutput);
          layerInput = layerOutput;
        }
      });

      // Convert activations to number arrays
      this.activations = [];
      this.layerOutputs = layerOutputs;

      // First layer (input layer)
      const inputValues = await this.inputTensor.array() as number[][];
      this.activations.push(inputValues[0]); // Just use the first sample for visualization

      // Hidden and output layers
      for (let i = 0; i < layerOutputs.length; i++) {
        const layerOutput = await layerOutputs[i].array() as number[][];
        this.activations.push(layerOutput[0]); // First sample's activation
      }
    } catch (error) {
      console.error('Error updating activations:', error);
    }
  }

  getActivations(): number[][] {
    return this.activations;
  }

  getEmptyActivations(): number[][] {
    return this.config.map(layer => Array(layer.neurons).fill(0));
  }

  getWeights(): any[] {
    if (!this.model) return [];

    const weights = [];
    for (let i = 0; i < this.model.layers.length; i++) {
      const layerWeights = this.model.layers[i].getWeights();
      if (layerWeights.length > 0) {
        // Convert weights and biases to arrays
        const weightValues = layerWeights[0].arraySync();
        const biasValues = layerWeights[1].arraySync();
        weights.push({ weights: weightValues, biases: biasValues });
      } else {
        weights.push({ weights: [], biases: [] });
      }
    }
    return weights;
  }

  resetModel(): void {
    this.initialize();
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
    if (this.inputTensor) {
      this.inputTensor.dispose();
    }
    if (this.outputTensor) {
      this.outputTensor.dispose();
    }
    for (const tensor of this.layerOutputs) {
      tensor.dispose();
    }
  }
}
