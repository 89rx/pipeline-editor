
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

export const LogNode = ({ id, data }) => {
  const [logLevel, setLogLevel] = useState(data?.logLevel || 'log');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` }
  ];

  return (
    <BaseNode id={id} data={data} title="Console Log" handles={handles}>
      <label>
        Log Level:
        <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
          <option value="log">Log</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="info">Info</option>
        </select>
      </label>
      <div style={{fontSize: '10px', color: '#666'}}>
        Logs data to console
      </div>
    </BaseNode>
  );
};