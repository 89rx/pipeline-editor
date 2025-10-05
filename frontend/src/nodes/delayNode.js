
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

export const DelayNode = ({ id, data }) => {
  const [delayMs, setDelayMs] = useState(data?.delayMs || 1000);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-output` }
  ];

  return (
    <BaseNode id={id} data={data} title="Delay" handles={handles}>
      <label>
        Delay (ms):
        <input 
          type="number" 
          value={delayMs} 
          onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)} 
          min="0"
          max="10000"
        />
      </label>
      <div style={{fontSize: '10px', color: '#666'}}>
        {delayMs > 0 ? `Will delay for ${delayMs}ms` : 'No delay'}
      </div>
    </BaseNode>
  );
};