import React, { useState } from 'react'
import Visualization from '../Visualization/Visualization'
import './ChartBuilder.css'

const CHART_TEMPLATES = {
  bar: [
    {
      name: 'Simple Bar Chart',
      dataRows: [
        { name: 'Category A', value: '45' },
        { name: 'Category B', value: '67' },
        { name: 'Category C', value: '32' },
        { name: 'Category D', value: '89' }
      ]
    },
    {
      name: 'Survey Results',
      dataRows: [
        { name: 'Strongly Agree', value: '120' },
        { name: 'Agree', value: '85' },
        { name: 'Neutral', value: '45' },
        { name: 'Disagree', value: '30' },
        { name: 'Strongly Disagree', value: '20' }
      ]
    }
  ],
  line: [
    {
      name: 'Time Series',
      dataRows: [
        { name: '2020', value: '100' },
        { name: '2021', value: '120' },
        { name: '2022', value: '135' },
        { name: '2023', value: '150' },
        { name: '2024', value: '165' }
      ]
    },
    {
      name: 'Growth Over Time',
      dataRows: [
        { name: 'Q1', value: '50' },
        { name: 'Q2', value: '65' },
        { name: 'Q3', value: '80' },
        { name: 'Q4', value: '95' }
      ]
    }
  ],
  pie: [
    {
      name: 'Distribution',
      dataRows: [
        { name: 'Option A', value: '35' },
        { name: 'Option B', value: '25' },
        { name: 'Option C', value: '20' },
        { name: 'Option D', value: '20' }
      ]
    },
    {
      name: 'Percentage Breakdown',
      dataRows: [
        { name: 'Group 1', value: '40' },
        { name: 'Group 2', value: '30' },
        { name: 'Group 3', value: '20' },
        { name: 'Group 4', value: '10' }
      ]
    }
  ]
}

function ChartBuilder({ visualization, onUpdate, onRemove }) {
  const [showTemplates, setShowTemplates] = useState(false)

  const handleUpdate = (field, value) => {
    if (onUpdate) {
      onUpdate(visualization.id, field, value)
    }
  }

  const handleDataRowUpdate = (rowIndex, field, value) => {
    const newRows = [...visualization.dataRows]
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value }
    handleUpdate('dataRows', newRows)
  }

  const addDataRow = () => {
    handleUpdate('dataRows', [...visualization.dataRows, { name: '', value: '' }])
  }

  const removeDataRow = (rowIndex) => {
    if (visualization.dataRows.length > 1) {
      const newRows = visualization.dataRows.filter((_, i) => i !== rowIndex)
      handleUpdate('dataRows', newRows)
    }
  }

  const applyTemplate = (template) => {
    handleUpdate('dataRows', template.dataRows.map(row => ({ ...row })))
    setShowTemplates(false)
  }

  const prepareChartData = () => {
    const data = visualization.dataRows
      .filter(r => r.name.trim() && r.value.trim())
      .map(r => {
        const obj = { name: r.name.trim() }
        if (visualization.type === 'bar' || visualization.type === 'line') {
          obj[visualization.dataKey || 'value'] = parseFloat(r.value) || 0
        } else if (visualization.type === 'pie') {
          obj.value = parseFloat(r.value) || 0
        }
        return obj
      })
    return data
  }

  const chartData = prepareChartData()
  const hasValidData = chartData.length > 0

  return (
    <div className="chart-builder">
      <div className="chart-builder-header">
        <div className="chart-builder-title-group">
          <input
            type="text"
            placeholder="Chart Title (e.g., Student Survey Results)"
            value={visualization.title}
            onChange={(e) => handleUpdate('title', e.target.value)}
            className="chart-title-input"
          />
          <select
            value={visualization.type}
            onChange={(e) => handleUpdate('type', e.target.value)}
            className="chart-type-select"
          >
            <option value="bar">📊 Bar Chart</option>
            <option value="line">📈 Line Chart</option>
            <option value="pie">🥧 Pie Chart</option>
          </select>
        </div>
        <div className="chart-builder-actions">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn-templates"
            title="Use Template"
          >
            📋 Templates
          </button>
          <button
            type="button"
            onClick={() => onRemove(visualization.id)}
            className="btn-remove-chart"
            title="Remove Chart"
          >
            🗑️ Remove
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="chart-templates">
          <h4>Choose a Template:</h4>
          <div className="templates-grid">
            {CHART_TEMPLATES[visualization.type]?.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyTemplate(template)}
                className="template-card"
              >
                <strong>{template.name}</strong>
                <span>{template.dataRows.length} data points</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chart-builder-content">
        <div className="chart-builder-form">
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Describe what this chart shows..."
              value={visualization.description || ''}
              onChange={(e) => handleUpdate('description', e.target.value)}
              rows={2}
              className="chart-description-input"
            />
          </div>

          <div className="form-group">
            <div className="data-header">
              <label>Data Points</label>
              <button
                type="button"
                onClick={addDataRow}
                className="btn-add-data"
              >
                + Add Row
              </button>
            </div>
            <div className="data-table">
              <div className="data-table-header">
                <div className="data-col-label">Label</div>
                <div className="data-col-value">Value</div>
                <div className="data-col-action"></div>
              </div>
              {visualization.dataRows.map((row, rowIndex) => (
                <div key={rowIndex} className="data-table-row">
                  <input
                    type="text"
                    placeholder="Label (e.g., 2020, Category A)"
                    value={row.name}
                    onChange={(e) => handleDataRowUpdate(rowIndex, 'name', e.target.value)}
                    className="data-input"
                  />
                  <input
                    type="number"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => handleDataRowUpdate(rowIndex, 'value', e.target.value)}
                    className="data-input"
                  />
                  {visualization.dataRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDataRow(rowIndex)}
                      className="btn-remove-data"
                      title="Remove Row"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!hasValidData && (
              <p className="data-hint">Add at least one data point with both label and value to see the chart.</p>
            )}
          </div>
        </div>

        {hasValidData && (
          <div className="chart-preview-panel">
            <h4>Live Preview</h4>
            <div className="chart-preview-container">
              <Visualization
                type={visualization.type}
                title={visualization.title || 'Chart Preview'}
                data={chartData}
                config={(() => {
                  const baseConfig = {
                    xKey: 'name',
                    description: visualization.description
                  }
                  
                  if (visualization.type === 'bar') {
                    baseConfig.bars = [{
                      dataKey: visualization.dataKey || 'value',
                      name: visualization.dataKey || 'value',
                      color: '#006EB6'
                    }]
                  } else if (visualization.type === 'line') {
                    baseConfig.lines = [{
                      dataKey: visualization.dataKey || 'value',
                      name: visualization.dataKey || 'value',
                      color: '#006EB6'
                    }]
                  } else if (visualization.type === 'pie') {
                    baseConfig.dataKey = 'value'
                    baseConfig.nameKey = 'name'
                  }
                  
                  return baseConfig
                })()}
              />
            </div>
          </div>
        )}
        {!hasValidData && (
          <div className="chart-preview-panel chart-preview-empty">
            <p className="preview-placeholder">Enter data points above to see a live preview of your chart.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartBuilder

