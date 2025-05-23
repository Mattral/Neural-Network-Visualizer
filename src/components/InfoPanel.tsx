
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { LayerConfig } from '@/types/neural-network';
import { BookOpen, Code, ChartLine } from 'lucide-react';

interface InfoPanelProps {
  config: LayerConfig[];
  selectedDataset: string;
}

const InfoPanel = ({ config, selectedDataset }: InfoPanelProps) => {
  // Generate a simplified math representation for each layer
  const generateMathEquation = (layer: LayerConfig, index: number) => {
    if (index === 0) return ''; // Skip input layer
    
    let equation = '';
    const prevLayer = `a^{(${index-1})}`;
    const currLayer = `a^{(${index})}`;
    let activation = '';
    
    switch (layer.activation) {
      case 'sigmoid':
        activation = '\\sigma';
        break;
      case 'relu':
        activation = 'ReLU';
        break;
      case 'tanh':
        activation = 'tanh';
        break;
      default:
        activation = '';
    }
    
    if (activation) {
      equation = `${currLayer} = ${activation}(W^{(${index})} \\cdot ${prevLayer} + b^{(${index})})`;
    } else {
      equation = `${currLayer} = W^{(${index})} \\cdot ${prevLayer} + b^{(${index})}`;
    }
    
    return equation;
  };
  
  // Generate simplified TensorFlow.js code for the current network
  const generateCode = () => {
    let code = `// Create a sequential model
const model = tf.sequential();

`;

    config.forEach((layer, index) => {
      if (index === 0) {
        code += `// Input layer
model.add(tf.layers.dense({
  units: ${layer.neurons},
  inputShape: [${layer.neurons}],
  activation: '${layer.activation}'
}));
`;
      } else {
        code += `
// ${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} layer
model.add(tf.layers.dense({
  units: ${layer.neurons},
  activation: '${layer.activation}'
}));
`;
      }
    });

    code += `
// Compile the model
model.compile({
  optimizer: tf.train.adam(0.01),
  loss: 'meanSquaredError',
  metrics: ['accuracy']
});

// Train the model
await model.fit(xs, ys, {
  epochs: 100,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(\`Epoch \${epoch}: loss = \${logs.loss}\`);
    }
  }
});`;

    return code;
  };

  // Generate learning process explanation based on dataset
  const getLearningExplanation = () => {
    switch (selectedDataset) {
      case 'xor':
        return (
          <div>
            <p>For the XOR problem, the network needs to learn that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>When both inputs are 0 or both are 1, output 0</li>
              <li>When inputs are different (0,1 or 1,0), output 1</li>
            </ul>
            <p className="mt-2">This requires at least one hidden layer because XOR is not linearly separable.</p>
            <p className="mt-3 text-xs italic">Watch how the network learns to curve its decision boundary to correctly classify all four cases.</p>
          </div>
        );
      case 'circle':
        return (
          <div>
            <p>The concentric circles problem requires the network to learn a circular decision boundary:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Points inside the circle are classified as one category</li>
              <li>Points outside are classified as another</li>
            </ul>
            <p className="mt-2">This is impossible for a linear model but neural networks can learn such curved boundaries.</p>
            <p className="mt-3 text-xs italic">Notice how the network gradually forms a curved decision boundary during training.</p>
          </div>
        );
      case 'spiral':
        return (
          <div>
            <p>The spiral classification problem is challenging because:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>It requires complex, twisting decision boundaries</li>
              <li>The patterns intertwine closely in the feature space</li>
              <li>Points that are close in space may belong to different classes</li>
            </ul>
            <p className="mt-2">This problem typically requires multiple hidden layers with sufficient neurons.</p>
            <p className="mt-3 text-xs italic">Deep networks with ReLU activation typically perform best on this task.</p>
          </div>
        );
      case 'linear':
        return (
          <div>
            <p>The linear separation problem is the simplest classification task:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Data can be separated by a straight line (or hyperplane)</li>
              <li>Even a network with no hidden layers can solve it</li>
            </ul>
            <p className="mt-2">This is a good starting point to understand how neural networks learn.</p>
            <p className="mt-3 text-xs italic">Try removing all hidden layers and see if the network can still learn this pattern!</p>
          </div>
        );
      case 'sine':
        return (
          <div>
            <p>The sine wave approximation demonstrates function fitting:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The network learns to predict continuous output values</li>
              <li>It must capture the periodic nature of the sine function</li>
              <li>This requires sufficient neurons to approximate the curve</li>
            </ul>
            <p className="mt-2">This is a regression problem rather than classification.</p>
            <p className="mt-3 text-xs italic">Networks with tanh activation often work well for trigonometric functions.</p>
          </div>
        );
      default:
        return (
          <p>Select a dataset to see specific learning details.</p>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <BookOpen className="mr-2 h-5 w-5" />
        Educational Information
      </h2>
      
      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="explanation" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Learning</span>
          </TabsTrigger>
          <TabsTrigger value="math" className="flex items-center gap-1">
            <ChartLine className="h-4 w-4" />
            <span className="hidden sm:inline">Math</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="explanation" className="mt-0">
          <Card className="p-4">
            <h3 className="font-medium mb-3">How Neural Networks Learn</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">1. Forward Propagation</h4>
                <p className="text-sm">
                  Input data passes through the network layer by layer. Each neuron calculates a weighted sum 
                  of its inputs and applies an activation function.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">2. Loss Calculation</h4>
                <p className="text-sm">
                  The network compares its prediction with the true values and calculates the error (loss).
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">3. Backpropagation</h4>
                <p className="text-sm">
                  The error is propagated backward through the network, and weights are adjusted to reduce 
                  the error in future predictions.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">4. Weight Updates</h4>
                <p className="text-sm">
                  The optimizer (like Adam) adjusts weights based on the gradients, trying to minimize the loss function.
                </p>
              </div>
            </div>
            
            <div className="bg-secondary/50 p-3 rounded-md">
              <h4 className="font-medium mb-2">Learning Process for {selectedDataset.toUpperCase()}</h4>
              {getLearningExplanation()}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="math" className="mt-0">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Mathematical Representation</h3>
            
            <div className="bg-secondary/50 p-3 rounded-md mb-4">
              <h4 className="font-medium mb-2">Network Architecture</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {config.map((layer, index) => (
                  <div key={index} className="text-sm">
                    <strong>Layer {index}:</strong> {layer.neurons} neurons, {layer.activation} activation
                  </div>
                ))}
              </div>
            </div>
            
            {config.map((layer, index) => (
              index > 0 && (
                <div key={index} className="mb-3">
                  <h4 className="font-medium mb-1">
                    Layer {index}: {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
                  </h4>
                  <div className="bg-secondary p-2 rounded text-sm font-mono">
                    {generateMathEquation(layer, index)}
                  </div>
                </div>
              )
            ))}
            
            <div className="mt-4">
              <h4 className="font-medium mb-1">Activation Functions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-secondary/50 rounded-md">
                  <strong>Sigmoid:</strong> σ(x) = 1/(1+e<sup>-x</sup>)
                  <div className="text-xs text-muted-foreground mt-1">
                    Maps values to range (0,1), good for binary classification
                  </div>
                </div>
                <div className="p-2 bg-secondary/50 rounded-md">
                  <strong>ReLU:</strong> f(x) = max(0, x)
                  <div className="text-xs text-muted-foreground mt-1">
                    Fast, non-saturating, standard for hidden layers
                  </div>
                </div>
                <div className="p-2 bg-secondary/50 rounded-md">
                  <strong>Tanh:</strong> tanh(x) = (e<sup>x</sup> - e<sup>-x</sup>)/(e<sup>x</sup> + e<sup>-x</sup>)
                  <div className="text-xs text-muted-foreground mt-1">
                    Maps values to range (-1,1), zero-centered
                  </div>
                </div>
                <div className="p-2 bg-secondary/50 rounded-md">
                  <strong>Linear:</strong> f(x) = x
                  <div className="text-xs text-muted-foreground mt-1">
                    No transformation, useful for regression problems
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="code" className="mt-0">
          <Card className="p-4">
            <h3 className="font-medium mb-2">TensorFlow.js Implementation</h3>
            <pre className="bg-secondary p-3 rounded text-xs overflow-x-auto max-h-[300px]">
              {generateCode()}
            </pre>
            
            <div className="mt-4 text-sm">
              <h4 className="font-medium mb-1">Key Concepts:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sequential model:</strong> Layers stacked linearly</li>
                <li><strong>Dense layer:</strong> Fully connected layer where each neuron connects to all neurons in the previous layer</li>
                <li><strong>Optimizer:</strong> Algorithm to update network weights (Adam is commonly used)</li>
                <li><strong>Loss function:</strong> Measures how far predictions are from actual values</li>
                <li><strong>Metrics:</strong> Ways to monitor training progress (like accuracy)</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoPanel;
