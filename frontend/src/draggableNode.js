

import './DraggableNode.css';

export const DraggableNode = ({ type, label, icon }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType }
    event.target.style.cursor = 'grabbing';
    event.target.style.transform = 'scale(0.95)';
    event.target.style.opacity = '0.8';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = (event) => {
    event.target.style.cursor = 'grab';
    event.target.style.transform = 'scale(1)';
    event.target.style.opacity = '1';
  };

  return (
    <div
      className={`draggable-node draggable-node-${type}`}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={onDragEnd}
      draggable
    >
      <div className="node-icon">{icon}</div>
      <span className="node-label">{label}</span>
    </div>
  );
};