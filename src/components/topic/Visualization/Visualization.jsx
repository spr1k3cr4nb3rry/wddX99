import React from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './Visualization.css'

const COLORS = ['#006EB6', '#4F9ACF', '#214491', '#60A5FA', '#93C5FD', '#C7D2FE']

function Visualization({ type, title, data, config = {} }) {
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="visualization-container">
        {title && <h3 className="visualization-title">{title}</h3>}
        <div className="visualization-error">
          No data available for visualization
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        // If bars array is provided, use it; otherwise use default
        const barsConfig = config.bars && config.bars.length > 0 
          ? config.bars 
          : [{ dataKey: config.dataKey || 'value', name: config.dataKey || 'value', color: COLORS[0] }]
        
        return (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey={config.xKey || 'name'} 
                stroke="#6b7280" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                cursor={{ fill: 'rgba(0, 110, 182, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              {barsConfig.map((bar, index) => (
                <Bar 
                  key={index}
                  dataKey={bar.dataKey} 
                  fill={bar.color || COLORS[index % COLORS.length]}
                  name={bar.name || bar.dataKey}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        // If lines array is provided, use it; otherwise use default
        const linesConfig = config.lines && config.lines.length > 0 
          ? config.lines 
          : [{ dataKey: config.dataKey || 'value', name: config.dataKey || 'value', color: COLORS[0] }]
        
        return (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey={config.xKey || 'name'} 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                cursor={{ stroke: '#006EB6', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {linesConfig.map((line, index) => (
                <Line 
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey} 
                  stroke={line.color || COLORS[index % COLORS.length]}
                  name={line.name || line.dataKey}
                  strokeWidth={3}
                  dot={{ fill: line.color || COLORS[index % COLORS.length], r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={130}
                fill="#8884d8"
                dataKey={config.dataKey || 'value'}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                formatter={(value, name) => [value, name]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="visualization-error">Unsupported chart type: {type}</div>
    }
  }

  return (
    <div className="visualization-container">
      {title && <h3 className="visualization-title">{title}</h3>}
      <div className="visualization-chart">
        {renderChart()}
      </div>
      {config.description && (
        <p className="visualization-description">{config.description}</p>
      )}
    </div>
  )
}

export default Visualization

