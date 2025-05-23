
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Play, Pause, RefreshCw, StepForward } from 'lucide-react';
import InfoToggle from './InfoToggle';

interface TrainingPanelProps {
  isTraining: boolean;
  trainMode: 'step' | 'continuous';
  onTrainModeChange: (mode: 'step' | 'continuous') => void;
  onTrainToggle: () => void;
  onTrainStep: () => void;
  onReset: () => void;
}

const TrainingPanel = ({
  isTraining,
  trainMode,
  onTrainModeChange,
  onTrainToggle,
  onTrainStep,
  onReset
}: TrainingPanelProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Training Controls</h2>
      
      <InfoToggle title="How to train your network">
        <p>Training a neural network involves repeatedly showing it examples and adjusting its weights to reduce errors.</p>
        <p className="mt-2"><strong>Step-by-Step mode:</strong> Press the "Step Forward" button to perform a single training iteration. This lets you observe how the network learns gradually.</p>
        <p className="mt-2"><strong>Continuous mode:</strong> Press "Start Training" to automatically train the network continuously. Press "Stop Training" to pause.</p>
        <p className="mt-2">The "Reset Network" button will reinitialize all weights, starting the learning process from scratch.</p>
      </InfoToggle>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="train-mode">Training Mode</Label>
          <Select
            value={trainMode}
            onValueChange={(value: any) => onTrainModeChange(value)}
            disabled={isTraining}
          >
            <SelectTrigger id="train-mode">
              <SelectValue placeholder="Training Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="step">Step-by-Step</SelectItem>
              <SelectItem value="continuous">Continuous</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          {trainMode === 'step' ? (
            <Button onClick={onTrainStep} className="w-full gap-2">
              <StepForward className="h-4 w-4" />
              Step Forward
            </Button>
          ) : (
            <Button 
              onClick={onTrainToggle}
              variant={isTraining ? "destructive" : "default"}
              className="w-full gap-2"
            >
              {isTraining ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Training
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Training
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onReset}
        variant="outline"
        className="w-full gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reset Network
      </Button>
      
      <div className="text-sm text-muted-foreground mt-2">
        <p>
          {trainMode === 'step' 
            ? 'Step-by-step mode: Manually control each training iteration to see gradual changes in the network.'
            : isTraining 
              ? 'Training in progress: Watch the network learn in real-time.'
              : 'Press Start to begin training the network automatically.'
          }
        </p>
      </div>
    </div>
  );
};

export default TrainingPanel;
