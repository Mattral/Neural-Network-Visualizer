
import { useEffect, useState } from "react";
import NetworkVisualizer from "@/components/NetworkVisualizer";
import ConfigPanel from "@/components/ConfigPanel";
import TrainingPanel from "@/components/TrainingPanel";
import MetricsPanel from "@/components/MetricsPanel";
import DatasetSelector from "@/components/DatasetSelector";
import InfoPanel from "@/components/InfoPanel";
import { NeuralNetworkModel } from "@/lib/NeuralNetworkModel";
import { LayerConfig } from "@/types/neural-network";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [model, setModel] = useState<NeuralNetworkModel | null>(null);
  const [selectedDataset, setSelectedDataset] = useState("xor");
  const [networkConfig, setNetworkConfig] = useState<LayerConfig[]>([
    { neurons: 2, activation: "linear", type: "input" },
    { neurons: 4, activation: "relu", type: "hidden" },
    { neurons: 1, activation: "sigmoid", type: "output" }
  ]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainMode, setTrainMode] = useState<"step" | "continuous">("continuous");
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [epochCount, setEpochCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [activations, setActivations] = useState<number[][]>([]);
  const [weights, setWeights] = useState<any[]>([]);

  // Initialize the model on component mount or config change
  useEffect(() => {
    const initModel = async () => {
      const newModel = new NeuralNetworkModel(networkConfig);
      await newModel.initialize();
      
      // Set initial weights and activations
      setWeights(newModel.getWeights());
      setActivations(newModel.getEmptyActivations());
      setModel(newModel);
      
      // Reset training metrics
      setLossHistory([]);
      setEpochCount(0);
      setAccuracy(0);
    };

    initModel();
  }, [networkConfig]);

  // Handle dataset change
  useEffect(() => {
    if (model) {
      model.loadDataset(selectedDataset);
    }
  }, [selectedDataset, model]);

  // Handle training logic
  useEffect(() => {
    let animationFrame: number;
    let lastStepTime = 0;
    
    const trainStep = async (timestamp: number) => {
      if (!model || !isTraining) return;
      
      // For step mode, we don't use requestAnimationFrame loop
      if (trainMode === "step") return;
      
      // Limit training speed to make visualization visible
      if (timestamp - lastStepTime > 100) {
        const { loss, accuracy: acc } = await model.trainStep();
        
        setLossHistory(prev => [...prev, loss]);
        setAccuracy(acc);
        setEpochCount(prev => prev + 1);
        setWeights(model.getWeights());
        setActivations(model.getActivations());
        
        lastStepTime = timestamp;
      }
      
      animationFrame = requestAnimationFrame(trainStep);
    };
    
    if (isTraining && trainMode === "continuous") {
      animationFrame = requestAnimationFrame(trainStep);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isTraining, trainMode, model]);

  const handleTrainStep = async () => {
    if (!model) return;
    
    const { loss, accuracy: acc } = await model.trainStep();
    setLossHistory(prev => [...prev, loss]);
    setAccuracy(acc);
    setEpochCount(prev => prev + 1);
    setWeights(model.getWeights());
    setActivations(model.getActivations());
  };

  const handleTrainToggle = () => {
    setIsTraining(prev => !prev);
  };

  const handleReset = () => {
    setIsTraining(false);
    if (model) {
      model.resetModel();
      setLossHistory([]);
      setEpochCount(0);
      setAccuracy(0);
      setWeights(model.getWeights());
      setActivations(model.getEmptyActivations());
    }
  };

  const handleNetworkConfigChange = (newConfig: LayerConfig[]) => {
    setIsTraining(false);
    setNetworkConfig(newConfig);
  };

  const handleInfoToggle = () => {
    setShowInfoPanel(prev => !prev);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col bg-gradient-to-b from-background to-background/95">
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Neural Network Visualizer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive educational tool for understanding neural networks. Build, train, and visualize neural networks in real-time.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-4 border shadow-sm min-h-[500px] flex items-center justify-center relative">
            {model && (
              <NetworkVisualizer 
                config={networkConfig}
                weights={weights}
                activations={activations}
              />
            )}
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <MetricsPanel 
              lossHistory={lossHistory}
              accuracy={accuracy}
              epochCount={epochCount}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <DatasetSelector 
              selectedDataset={selectedDataset}
              onSelectDataset={setSelectedDataset}
            />
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <ConfigPanel 
              config={networkConfig}
              onConfigChange={handleNetworkConfigChange}
            />
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <TrainingPanel 
              isTraining={isTraining}
              trainMode={trainMode}
              onTrainModeChange={setTrainMode}
              onTrainToggle={handleTrainToggle}
              onTrainStep={handleTrainStep}
              onReset={handleReset}
            />
          </div>
          
          <button 
            onClick={handleInfoToggle}
            className="w-full py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors flex items-center justify-center gap-2"
          >
            {showInfoPanel ? "Hide" : "Show"} Educational Information
          </button>
          
          {showInfoPanel && (
            <div className="bg-card rounded-lg p-4 border shadow-sm">
              <InfoPanel 
                config={networkConfig}
                selectedDataset={selectedDataset}
              />
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Neural Network Visualizer - Built with TensorFlow.js, D3.js, and React</p>
      </footer>
    </div>
  );
};

export default Index;
