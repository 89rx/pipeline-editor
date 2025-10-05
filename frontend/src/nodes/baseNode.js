
import React from 'react';
import { Handle } from 'reactflow';
import './baseNode.css';

export const BaseNode = ({ 
  id, 
  data, 
  title, 
  handles = [],
  children,
  style = {}
}) => {

  const handleFormElementMouseDown = (e) => {
    e.stopPropagation();
  };

  const nodeRef = React.useRef(null);

  React.useEffect(() => {
    const currentNode = nodeRef.current;
    
    const addFormElementListeners = (element) => {
      if (!element) return;
      
      const formElements = element.querySelectorAll('input, select, textarea, button');
      
      formElements.forEach(formElement => {
        formElement.removeEventListener('mousedown', handleFormElementMouseDown);
        formElement.addEventListener('mousedown', handleFormElementMouseDown);
      });
    };

    if (currentNode) {
      addFormElementListeners(currentNode);
    }
    
    return () => {
      if (currentNode) {
        const formElements = currentNode.querySelectorAll('input, select, textarea, button');
        formElements.forEach(formElement => {
          formElement.removeEventListener('mousedown', handleFormElementMouseDown);
        });
      }
    };
  }, [children]); 

  return (
    <div 
      ref={nodeRef}
      className="base-node" 
      style={style}
    >
      <div className="node-header">
        <span>{title}</span>
      </div>
      
      <div className="node-content">
        {children}
      </div>
      
      {handles.map(handle => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={handle.style}
        />
      ))}
    </div>
  );
};