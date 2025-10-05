
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

export const FilterNode = ({ id, data }) => {
  const [filterType, setFilterType] = useState(data?.filterType || 'contains');
  const [filterValue, setFilterValue] = useState(data?.filterValue || '');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-output` }
  ];

  return (
    <BaseNode id={id} data={data} title="Filter" handles={handles}>
      <label>
        Filter by:
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="contains">Contains</option>
          <option value="startsWith">Starts With</option>
          <option value="endsWith">Ends With</option>
          <option value="length">Length</option>
        </select>
      </label>
      <label>
        Value:
        <input 
          type="text" 
          value={filterValue} 
          onChange={(e) => setFilterValue(e.target.value)} 
          placeholder="Filter value..."
        />
      </label>
    </BaseNode>
  );
};