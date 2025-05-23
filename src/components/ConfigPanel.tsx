
import { useState } from 'react';
import { LayerConfig } from '@/types/neural-network';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Layers, Plus, Minus, Save } from 'lucide-react';
import InfoToggle from './InfoToggle';

interface ConfigPanelProps {
  config: LayerConfig[];
  onConfigChange: (config: LayerConfig[]) => void;
}

const ConfigPanel = ({ config, onConfigChange }: ConfigPanelProps) => {
  const [tempConfig, setTempConfig] = useState<LayerConfig[]>(config);
  
  const handleNeuronChange = (layerIndex: number, value: number) => {
    const newConfig = [...tempConfig];
    newConfig[layerIndex] = {
      ...newConfig[layerIndex],
      neurons: Math.max(1, value)
    };
    setTempConfig(newConfig);
  };
  
  const handleActivationChange = (layerIndex: number, value: string) => {
    const newConfig = [...tempConfig];
    newConfig[layerIndex] = {
      ...newConfig[layerIndex],
      activation: value as any
    };
    setTempConfig(newConfig);
  };
  
  const handleAddLayer = () => {
    const newConfig = [...tempConfig];
    
    // Insert a new hidden layer before the output layer
    newConfig.splice(newConfig.length - 1, 0, {
      neurons: 4,
      activation: 'relu',
      type: 'hidden'
    });
    
    setTempConfig(newConfig);
  };
  
  const handleRemoveLayer = (layerIndex: number) => {
    // Cannot remove input or output layers
    if (layerIndex === 0 || layerIndex === tempConfig.length - 1) return;
    
    const newConfig = [...tempConfig];
    newConfig.splice(layerIndex, 1);
    setTempConfig(newConfig);
  };
  
  const handleApplyChanges = () => {
    onConfigChange(tempConfig);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <Layers className="mr-2 h-5 w-5" />
        Network Architecture
      </h2>
      
      <InfoToggle title="Understanding network architecture">
        <p><strong>Input Layer:</strong> Receives data from your dataset. Each neuron represents a feature in your data.</p>
        <p className="mt-2"><strong>Hidden Layers:</strong> Process the input and extract complex patterns. More layers and neurons can learn more complex relationships, but may overfit.</p>
        <p className="mt-2"><strong>Output Layer:</strong> Produces the final prediction. For binary classification, typically use 1 neuron with sigmoid activation.</p>
        <p className="mt-2"><strong>Activation Functions:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li><strong>ReLU:</strong> Fast, good default for hidden layers</li>
          <li><strong>Sigmoid:</strong> Maps output to 0-1 range, good for binary classification</li>
          <li><strong>Tanh:</strong> Maps output to -1 to 1 range</li>
          <li><strong>Linear:</strong> No transformation, used for regression problems</li>
        </ul>
      </InfoToggle>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {tempConfig.map((layer, index) => (
          <Card key={index} className="p-3 border-l-4" style={{
            borderLeftColor: layer.type === 'input' 
              ? 'hsl(var(--primary))' 
              : layer.type === 'output' 
                ? 'hsl(var(--destructive))' 
                : 'hsl(var(--secondary))'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center">
                {layer.type === 'input' && (
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                )}
                {layer.type === 'hidden' && (
                  <span className="inline-block w-2 h-2 bg-secondary rounded-full mr-2"></span>
                )}
                {layer.type === 'output' && (
                  <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
                )}
                {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} Layer
              </h3>
              
              {layer.type === 'hidden' && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLayer(index)}
                >
                  <Minus className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`neurons-${index}`} className="text-xs">Neurons</Label>
                <Input 
                  id={`neurons-${index}`}
                  type="number"
                  min={1}
                  value={layer.neurons}
                  onChange={(e) => handleNeuronChange(index, parseInt(e.target.value))}
                  disabled={layer.type === 'input'}
                />
              </div>
              
              <div>
                <Label htmlFor={`activation-${index}`} className="text-xs">Activation</Label>
                <Select
                  value={layer.activation}
                  onValueChange={(value) => handleActivationChange(index, value)}
                  disabled={layer.type === 'input'}
                >
                  <SelectTrigger id={`activation-${index}`}>
                    <SelectValue placeholder="Activation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="sigmoid">Sigmoid</SelectItem>
                    <SelectItem value="relu">ReLU</SelectItem>
                    <SelectItem value="tanh">Tanh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAddLayer}
          className="flex-1 gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Hidden Layer
        </Button>
        
        <Button 
          onClick={handleApplyChanges}
          className="flex-1 gap-1"
        >
          <Save className="h-4 w-4" />
          Apply Changes
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {tempConfig.length === 2 
          ? "This is a simple network with no hidden layers. Consider adding hidden layers for complex problems."
          : tempConfig.length > 4 
            ? "Deep network with multiple hidden layers. Good for complex patterns but may be harder to train."
            : "Balanced architecture with hidden layers. Good for most problems."
        }
      </div>
    </div>
  );
};

export default ConfigPanel;
