
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LayerConfig } from '@/types/neural-network';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NetworkVisualizerProps {
  config: LayerConfig[];
  weights: any[];
  activations: number[][];
}

const NetworkVisualizer = ({ config, weights, activations }: NetworkVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [networkInfo, setNetworkInfo] = useState<string>('');
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    renderNetwork();
    
    // Update network info
    const totalNeurons = config.reduce((sum, layer) => sum + layer.neurons, 0);
    const totalConnections = calculateTotalConnections(config);
    setNetworkInfo(`${config.length} layers | ${totalNeurons} neurons | ${totalConnections} connections`);
  }, [config, weights, activations]);
  
  const calculateTotalConnections = (layerConfig: LayerConfig[]): number => {
    let connections = 0;
    for (let i = 0; i < layerConfig.length - 1; i++) {
      connections += layerConfig[i].neurons * layerConfig[i + 1].neurons;
    }
    return connections;
  };
  
  const formatSafeNumber = (value: any, decimals: number = 3): string => {
    // Check if the value is defined and is a number
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0.000';
    }
    return Number(value).toFixed(decimals);
  };
  
  const renderNetwork = () => {
    if (!svgRef.current) return;
    
    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Calculate positions
    const layerSpacing = width / (config.length + 1);
    const neurons: any[] = [];
    const connections: any[] = [];
    
    // Create neurons for each layer
    config.forEach((layer, layerIndex) => {
      const neuronSpacing = height / (layer.neurons + 1);
      
      for (let i = 0; i < layer.neurons; i++) {
        const neuron = {
          id: `L${layerIndex}N${i}`,
          layerIndex,
          neuronIndex: i,
          x: layerSpacing * (layerIndex + 1),
          y: neuronSpacing * (i + 1),
          activation: activations[layerIndex] ? activations[layerIndex][i] || 0 : 0,
          activationFunction: layer.activation,
          layerType: layer.type
        };
        
        neurons.push(neuron);
      }
    });
    
    // Create connections between neurons
    for (let layerIndex = 0; layerIndex < config.length - 1; layerIndex++) {
      const sourceLayer = neurons.filter(n => n.layerIndex === layerIndex);
      const targetLayer = neurons.filter(n => n.layerIndex === layerIndex + 1);
      
      sourceLayer.forEach(source => {
        targetLayer.forEach((target, targetIndex) => {
          // Get weight if available
          const weight = weights[layerIndex] && 
                       weights[layerIndex].weights && 
                       weights[layerIndex].weights[source.neuronIndex] ? 
                       weights[layerIndex].weights[source.neuronIndex][targetIndex] : 0;
          
          connections.push({
            id: `${source.id}-${target.id}`,
            sourceId: source.id,
            targetId: target.id,
            weight: weight,
            source: source,
            target: target
          });
        });
      });
    }
    
    // Add gradient definitions for connections
    const defs = svg.append('defs');
    
    // Positive weight gradient
    const positiveGradient = defs.append('linearGradient')
      .attr('id', 'positiveGradient')
      .attr('gradientUnits', 'userSpaceOnUse');
      
    positiveGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(217.2 91.2% 59.8% / 0.5)');
      
    positiveGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(217.2 91.2% 59.8% / 0.8)');
    
    // Negative weight gradient  
    const negativeGradient = defs.append('linearGradient')
      .attr('id', 'negativeGradient')
      .attr('gradientUnits', 'userSpaceOnUse');
      
    negativeGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(0 91.2% 59.8% / 0.5)');
      
    negativeGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(0 91.2% 59.8% / 0.8)');
    
    // Create layer groups and labels
    const layerGroups = svg.selectAll('.layer-group')
      .data(config)
      .enter()
      .append('g')
      .attr('class', 'layer-group');
    
    // Add layer labels with activation function
    layerGroups
      .append('text')
      .attr('class', 'layer-label')
      .attr('x', (d, i) => layerSpacing * (i + 1))
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .text(d => {
        const layerName = d.type.charAt(0).toUpperCase() + d.type.slice(1);
        const activation = d.type !== 'input' ? ` (${d.activation})` : '';
        return `${layerName}${activation}`;
      });
    
    // Draw connections
    const connectionElements = svg.selectAll('.connection')
      .data(connections)
      .enter()
      .append('path')
      .attr('class', d => {
        let classes = 'connection';
        if (d.weight > 0) classes += ' connection-positive';
        if (d.weight < 0) classes += ' connection-negative';
        return classes;
      })
      .attr('d', d => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;
        return `M ${sourceX} ${sourceY} C ${(sourceX + targetX) / 2} ${sourceY}, ${(sourceX + targetX) / 2} ${targetY}, ${targetX} ${targetY}`;
      })
      .style('stroke', d => d.weight > 0 ? 'url(#positiveGradient)' : (d.weight < 0 ? 'url(#negativeGradient)' : 'hsl(var(--muted-foreground))'))
      .style('stroke-width', d => Math.min(Math.abs(d.weight) * 3, 5) || 1)
      .each(function(d) {
        // Set the gradient coordinates
        const path = d3.select(this);
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;
        
        if (d.weight > 0) {
          d3.select('#positiveGradient')
            .attr('x1', sourceX)
            .attr('y1', sourceY)
            .attr('x2', targetX)
            .attr('y2', targetY);
        } else if (d.weight < 0) {
          d3.select('#negativeGradient')
            .attr('x1', sourceX)
            .attr('y1', sourceY)
            .attr('x2', targetX)
            .attr('y2', targetY);
        }
      });
    
    // Draw neurons
    const neuronGroups = svg.selectAll('.neuron-group')
      .data(neurons)
      .enter()
      .append('g')
      .attr('class', 'neuron-group')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // Add neuron circles with glow effect for active neurons
    neuronGroups.append('circle')
      .attr('class', d => {
        const activation = Math.abs(d.activation);
        return activation > 0.5 ? 'neuron neuron-active' : 'neuron';
      })
      .attr('r', 15)
      .style('opacity', d => {
        // Map activation to opacity (0.3 - 1.0)
        const activation = Math.abs(d.activation);
        return 0.3 + (activation * 0.7);
      })
      .each(function(d) {
        // Add animation for active neurons
        if (Math.abs(d.activation) > 0.7) {
          d3.select(this).classed('animate-pulse-neuron', true);
        }
      });
      
    // Add activation values
    neuronGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', 'currentColor')
      .attr('font-size', '10px')
      .text(d => formatSafeNumber(d.activation, 1));
    
    // Add tooltips as SVG title elements
    neuronGroups.append('title')
      .text(d => {
        return `Neuron: Layer ${d.layerIndex + 1}, Index ${d.neuronIndex + 1}
Activation: ${formatSafeNumber(d.activation)}
Type: ${d.layerType}
Function: ${d.activationFunction}`;
      });
      
    connectionElements.append('title')
      .text(d => `Weight: ${formatSafeNumber(d.weight)}`);
  };
  
  return (
    <div className="relative w-full h-full">
      <div className="network-info">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>{networkInfo}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This visualization shows the current state of your neural network.</p>
              <p className="mt-1">Brighter neurons = higher activation</p>
              <p className="mt-1">Blue lines = positive weights</p>
              <p className="mt-1">Red lines = negative weights</p>
              <p className="mt-1">Line thickness = weight magnitude</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full min-h-[400px]"
        data-testid="network-visualizer"
      />
    </div>
  );
};

export default NetworkVisualizer;
