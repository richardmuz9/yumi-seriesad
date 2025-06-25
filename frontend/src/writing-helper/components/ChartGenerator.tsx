import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartType,
  ChartData,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartGeneratorProps {
  onChartChange?: (chartData: ChartData, type: ChartType) => void;
}

export const ChartGenerator: React.FC<ChartGeneratorProps> = ({ onChartChange }) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [data, setData] = useState<string>('');
  const [labels, setLabels] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const chartRef = useRef<ChartJS>(null);

  const chartTypes: ChartType[] = ['line', 'bar', 'doughnut', 'pie', 'scatter'];

  const parseData = (input: string): number[] => {
    return input.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
  };

  const parseLabels = (input: string): string[] => {
    return input.split(',').map(label => label.trim());
  };

  const generateChartData = (): ChartData => {
    const parsedData = parseData(data);
    const parsedLabels = parseLabels(labels);

    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(153, 102, 255)',
    ];

    return {
      labels: parsedLabels,
      datasets: [
        {
          label: title || 'Dataset',
          data: parsedData,
          borderColor: colors[0],
          backgroundColor: chartType === 'pie' || chartType === 'doughnut' 
            ? colors.slice(0, parsedData.length)
            : colors[0].replace('rgb', 'rgba').replace(')', ', 0.5)'),
        },
      ],
    };
  };

  const handleExport = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleGenerateFromCSV = () => {
    // Sample data for demonstration
    const sampleData = "10,20,30,40,50";
    const sampleLabels = "Jan,Feb,Mar,Apr,May";
    setData(sampleData);
    setLabels(sampleLabels);
    setTitle("Sample Chart");
  };

  useEffect(() => {
    if (data && labels) {
      const chartData = generateChartData();
      onChartChange?.(chartData, chartType);
    }
  }, [data, labels, title, chartType]);

  return (
    <div className="chart-generator-panel">
      <div className="chart-controls">
        <div className="control-group">
          <label>Chart Type:</label>
          <select 
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
          >
            {chartTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chart title"
          />
        </div>

        <div className="control-group">
          <label>Data (comma-separated):</label>
          <input
            type="text"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="1, 2, 3, 4, 5"
          />
        </div>

        <div className="control-group">
          <label>Labels (comma-separated):</label>
          <input
            type="text"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            placeholder="Jan, Feb, Mar, Apr, May"
          />
        </div>

        <div className="chart-actions">
          <button onClick={handleGenerateFromCSV} className="generate-btn">
            📊 Generate Sample
          </button>
          <button onClick={handleExport} className="export-btn">
            💾 Export PNG
          </button>
        </div>
      </div>

      {data && labels && (
        <div className="chart-preview">
          <Chart
            ref={chartRef}
            type={chartType}
            data={generateChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: !!title,
                  text: title,
                  color: '#ffffff',
                },
                legend: {
                  labels: {
                    color: '#ffffff',
                  },
                },
              },
              scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
                x: {
                  ticks: {
                    color: '#ffffff',
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
                y: {
                  ticks: {
                    color: '#ffffff',
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              } : undefined,
            }}
          />
        </div>
      )}
    </div>
  );
}; 