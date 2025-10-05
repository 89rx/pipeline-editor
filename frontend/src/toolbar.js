import { DraggableNode } from './draggableNode';
import './Toolbar.css';

export const PipelineToolbar = () => {
  const nodeCategories = {
    "Input/Output": [
      { type: 'customInput', label: 'Input', icon: '📥' },
      { type: 'customOutput', label: 'Output', icon: '📤' }
    ],
    "AI & Processing": [
      { type: 'llm', label: 'LLM', icon: '🤖' },
      { type: 'text', label: 'Text', icon: '📝' },
      { type: 'filter', label: 'Filter', icon: '🔍' }
    ],
    "Utilities": [
      { type: 'math', label: 'Math', icon: '🧮' },
      { type: 'delay', label: 'Delay', icon: '⏱️' },
      { type: 'http', label: 'HTTP', icon: '🌐' },
      { type: 'log', label: 'Log', icon: '📋' }
    ]
  };

  return (
    <div className="toolbar-container">
      {Object.entries(nodeCategories).map(([category, nodes]) => (
        <div key={category} className="toolbar-category">
          <h4 className="category-title">{category}</h4>
          <div className="nodes-grid">
            {nodes.map((node) => (
              <DraggableNode 
                key={node.type}
                type={node.type} 
                label={node.label}
                icon={node.icon}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
