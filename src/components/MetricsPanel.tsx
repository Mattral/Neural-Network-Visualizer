import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import InfoToggle from './InfoToggle';
import { LineChart, Percent, IterationCw } from 'lucide-react';

interface MetricsPanelProps {
  lossHistory: number[];
  accuracy: number;
  epochCount: number;
}

const MetricsPanel = ({ lossHistory, accuracy, epochCount }: MetricsPanelProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || lossHistory.length === 0) return;
    
    renderChart();
  }, [lossHistory]);
  
  const renderChart = () => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const svg = d3.select(chartRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleLinear()
      .domain([0, lossHistory.length - 1])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(lossHistory) || 1])
      .range([height, 0]);
    
    // Add gradient for the area under the curve
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
      
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(var(--primary))')
      .attr('stop-opacity', 0.7);
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(var(--primary))')
      .attr('stop-opacity', 0.1);
    
    // Create area generator
    const area = d3.area<number>()
      .x((d, i) => x(i))
      .y0(height)
      .y1(d => y(d))
      .curve(d3.curveMonotoneX);
    
    // Create line generator
    const line = d3.line<number>()
      .x((d, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);
    
    // Add X grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickSize(-height)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', 'hsl(var(--border))')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '2,2')
      );
    
    // Add Y grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', 'hsl(var(--border))')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '2,2')
      );
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .append('text')
      .attr('fill', 'currentColor')
      .attr('x', width / 2)
      .attr('y', margin.bottom)
      .attr('text-anchor', 'middle')
      .text('Epoch');
    
    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .append('text')
      .attr('fill', 'currentColor')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('Loss');
    
    // Add area under the curve
    g.append('path')
      .datum(lossHistory)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);
    
    // Add loss line
    g.append('path')
      .datum(lossHistory)
      .attr('class', 'chart-line')
      .attr('d', line);
    
    // Add dots for each data point
    g.selectAll('.dot')
      .data(lossHistory)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d, i) => x(i))
      .attr('cy', d => y(d))
      .attr('r', 3)
      .attr('fill', 'hsl(var(--primary))');
      
    // Add tooltip hover effect
    const tooltip = svg.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');
      
    tooltip.append('circle')
      .attr('r', 5)
      .style('fill', 'hsl(var(--primary))');
      
    tooltip.append('rect')
      .attr('width', 100)
      .attr('height', 50)
      .attr('x', 10)
      .attr('y', -22)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', 'hsl(var(--card))')
      .style('stroke', 'hsl(var(--border))');
      
    const text = tooltip.append('text')
      .style('fill', 'currentColor')
      .style('font-size', '12px')
      .attr('x', 18)
      .attr('y', 0);
      
    text.append('tspan')
      .attr('x', 18)
      .attr('dy', '0.5em')
      .text('Epoch:');
      
    text.append('tspan')
      .attr('id', 'tooltip-epoch-value')
      .attr('x', 60)
      .attr('dy', '0em')
      .text('0');
      
    text.append('tspan')
      .attr('x', 18)
      .attr('dy', '1.5em')
      .text('Loss:');
      
    text.append('tspan')
      .attr('id', 'tooltip-loss-value')
      .attr('x', 60)
      .attr('dy', '0em')
      .text('0');
      
    // Create a rect to catch mouse events
    svg.append('rect')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function() { tooltip.style('display', null); })
      .on('mouseout', function() { tooltip.style('display', 'none'); })
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event, this);
        const adjustedX = mouseX - margin.left;
        const x0 = x.invert(adjustedX);
        const i = Math.round(x0);
        
        if (i >= 0 && i < lossHistory.length) {
          const loss = lossHistory[i];
          const cx = x(i) + margin.left;
          const cy = y(loss) + margin.top;
          
          tooltip.attr('transform', `translate(${cx}, ${cy})`);
          tooltip.select('#tooltip-epoch-value').text(i);
          tooltip.select('#tooltip-loss-value').text(loss.toFixed(4));
        }
      });
  };
  
  // Function to calculate learning progress based on loss history
  const getLearningProgress = () => {
    if (lossHistory.length < 2) return 'Just starting';
    
    const initialLoss = lossHistory[0];
    const currentLoss = lossHistory[lossHistory.length - 1];
    const reduction = (initialLoss - currentLoss) / initialLoss * 100;
    
    if (reduction < 10) return 'Just starting';
    if (reduction < 30) return 'Learning slowly';
    if (reduction < 60) return 'Making progress';
    if (reduction < 80) return 'Learning well';
    return 'Almost converged';
  };
  
  // Calculate the learning trend (improving, stable, or worsening)
  const getLearningTrend = () => {
    if (lossHistory.length < 5) return 'Not enough data';
    
    const recentLosses = lossHistory.slice(-5);
    const avgChange = (recentLosses[0] - recentLosses[recentLosses.length - 1]) / 4;
    
    if (avgChange > 0.01) return 'Improving';
    if (avgChange < -0.01) return 'Worsening';
    return 'Stable';
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <LineChart className="mr-2 h-5 w-5" />
        Training Metrics
      </h2>
      
      <InfoToggle title="What do these metrics mean?">
        <p><strong>Epochs:</strong> The number of complete passes through the training dataset.</p>
        <p className="mt-1"><strong>Accuracy:</strong> The percentage of correct predictions on the training data.</p>
        <p className="mt-1"><strong>Loss:</strong> A measure of how far the model's predictions are from the true values. Lower is better.</p>
        <p className="mt-1">As training progresses, you should see the loss decrease and accuracy increase, indicating the model is learning.</p>
      </InfoToggle>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-secondary p-3 rounded-lg flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center">
            <IterationCw className="mr-1 h-4 w-4" />
            Epochs
          </div>
          <div className="text-2xl font-semibold">{epochCount}</div>
          <div className="mt-auto text-xs text-muted-foreground">
            {epochCount > 0 ? 'Training in progress' : 'Not started'}
          </div>
        </div>
        
        <div className="bg-secondary p-3 rounded-lg flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center">
            <Percent className="mr-1 h-4 w-4" />
            Accuracy
          </div>
          <div className="text-2xl font-semibold">{(accuracy * 100).toFixed(1)}%</div>
          <div className="mt-auto text-xs text-muted-foreground">
            {accuracy > 0.95 ? 'Excellent' : accuracy > 0.8 ? 'Good' : accuracy > 0.6 ? 'Fair' : 'Needs improvement'}
          </div>
        </div>
        
        <div className="bg-secondary p-3 rounded-lg flex flex-col">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-lg font-medium">{getLearningProgress()}</div>
          <div className="mt-auto text-xs text-muted-foreground">
            Trend: {getLearningTrend()}
          </div>
        </div>
      </div>
      
      <div className="h-[200px] bg-card p-4 rounded-lg border">
        <svg ref={chartRef} className="w-full h-full" />
      </div>
      
      {lossHistory.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Initial loss: {lossHistory[0].toFixed(4)}</span>
            <span>Current loss: {lossHistory[lossHistory.length - 1].toFixed(4)}</span>
          </div>
          <div className="flex justify-center mt-1">
            <span className="highlight-badge">
              {((lossHistory[0] - lossHistory[lossHistory.length - 1]) / lossHistory[0] * 100).toFixed(1)}% improvement
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;
