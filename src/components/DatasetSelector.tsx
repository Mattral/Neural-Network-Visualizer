
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import InfoToggle from './InfoToggle';

interface DatasetSelectorProps {
  selectedDataset: string;
  onSelectDataset: (dataset: string) => void;
}

const DatasetSelector = ({ selectedDataset, onSelectDataset }: DatasetSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dataset</h2>
      
      <div>
        <Label htmlFor="dataset-select">Select Dataset</Label>
        <Select 
          value={selectedDataset}
          onValueChange={onSelectDataset}
        >
          <SelectTrigger id="dataset-select">
            <SelectValue placeholder="Select a dataset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xor">XOR Problem</SelectItem>
            <SelectItem value="circle">Concentric Circles</SelectItem>
            <SelectItem value="spiral">Spiral Classification</SelectItem>
            <SelectItem value="linear">Linear Separation</SelectItem>
            <SelectItem value="sine">Sine Function</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {selectedDataset === 'xor' && (
          <>
            <p>The XOR problem is a classic neural network challenge where inputs of (0,0) and (1,1) yield 0, while (0,1) and (1,0) yield 1.</p>
            <InfoToggle title="Why is XOR important?">
              <p>The XOR problem demonstrates why we need hidden layers in neural networks. It's not linearly separable, which means a single-layer network cannot solve it.</p>
              <p className="mt-2">This was historically significant as it was used to criticize early neural networks, until multi-layer networks were developed.</p>
              <p className="mt-2">Try adding and removing hidden layers to see how it affects the network's ability to learn this pattern!</p>
            </InfoToggle>
          </>
        )}
        {selectedDataset === 'circle' && (
          <>
            <p>Classifies points as inside or outside a circle - a simple demonstration of nonlinear decision boundaries.</p>
            <InfoToggle title="Understanding the Circle Dataset">
              <p>The concentric circles dataset is another example of a non-linearly separable problem. Points are classified based on whether they fall inside or outside a circle.</p>
              <p className="mt-2">This problem demonstrates why linear models fail at certain classification tasks, and why neural networks with non-linear activation functions excel.</p>
              <p className="mt-2">Recommended network: 2 input neurons, 4-8 hidden neurons with ReLU activation, 1 output neuron with sigmoid activation.</p>
            </InfoToggle>
          </>
        )}
        {selectedDataset === 'spiral' && (
          <>
            <p>A challenging classification problem with two intertwined spiral patterns that requires multiple hidden layers to solve effectively.</p>
            <InfoToggle title="Why Spirals are Challenging">
              <p>The spiral dataset contains points arranged in an interlocking spiral pattern. This is one of the more challenging classification problems for neural networks.</p>
              <p className="mt-2">It requires the network to learn complex decision boundaries that twist through the input space.</p>
              <p className="mt-2">This problem typically requires at least 2 hidden layers with several neurons each to solve effectively.</p>
            </InfoToggle>
          </>
        )}
        {selectedDataset === 'linear' && (
          <>
            <p>A simple linear classification problem that can be solved with a single-layer network - perfect for beginners.</p>
            <InfoToggle title="Linear Separation Explained">
              <p>This dataset contains points that can be separated by a straight line. It's the simplest classification problem for neural networks.</p>
              <p className="mt-2">A single-layer network without any hidden layers can successfully learn this pattern.</p>
              <p className="mt-2">This is a good starting point to understand how neural networks learn decision boundaries.</p>
            </InfoToggle>
          </>
        )}
        {selectedDataset === 'sine' && (
          <>
            <p>Learn to approximate a sine wave function - a great example of neural networks for function approximation.</p>
            <InfoToggle title="Function Approximation">
              <p>This dataset challenges the network to learn the sine function. It demonstrates how neural networks can approximate continuous mathematical functions.</p>
              <p className="mt-2">Unlike classification, this is a regression problem where the network must predict a continuous value.</p>
              <p className="mt-2">Try different activation functions to see how they affect the network's ability to fit a curve!</p>
            </InfoToggle>
          </>
        )}
      </div>
    </div>
  );
};

export default DatasetSelector;
