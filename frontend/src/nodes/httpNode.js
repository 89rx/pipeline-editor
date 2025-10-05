
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

export const HttpNode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || 'https://api.example.com/data');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-trigger` },
    { type: 'source', position: Position.Right, id: `${id}-response` },
    { type: 'source', position: Position.Right, id: `${id}-error`, style: { top: '70%' } }
  ];

  return (
    <BaseNode id={id} data={data} title="HTTP Request" handles={handles}>
      <label>
        Method:
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
      <label>
        URL:
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://api.example.com"
        />
      </label>
    </BaseNode>
  );
};