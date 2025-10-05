import { useState, useEffect, useRef } from 'react';
import { Position, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '');
  const [textAreaValue, setTextAreaValue] = useState(data?.text || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const { nodes, onEdgesChange } = useStore();
  const { getEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const getAvailableInputs = () => {
    const nodeNames = new Set();
    
    nodes.forEach(node => {
      if (node.id !== id) {
        let nodeName = '';
        switch (node.type) {
          case 'customInput':
            nodeName = 'input';
            break;
          case 'customOutput':
            nodeName = 'output';
            break;
          case 'llm':
            nodeName = 'llm';
            break;
          case 'text':
            nodeName = 'text';
            break;
          case 'math':
            nodeName = 'math';
            break;
          case 'filter':
            nodeName = 'filter';
            break;
          case 'delay':
            nodeName = 'delay';
            break;
          case 'http':
            nodeName = 'http';
            break;
          case 'log':
            nodeName = 'log';
            break;
          default:
            if (node.type) {
              nodeName = node.type.replace('Node', '').toLowerCase();
            }
        }
        
        if (nodeName) {
          nodeNames.add(nodeName);
        }
      }
    });
    
    return Array.from(nodeNames);
  };

  const extractVariables = (text) => {
    const variableRegex = /{{(\w+)}}/g;
    const matches = [];
    let match;
    
    variableRegex.lastIndex = 0;
    
    while ((match = variableRegex.exec(text)) !== null) {
      const cleanVariable = match[1].replace(/[^a-zA-Z0-9_]/g, '');
      if (cleanVariable) {
        matches.push(cleanVariable);
      }
    }
    return matches;
  };

  const variables = extractVariables(currText);
  const availableInputs = getAvailableInputs();

  const handles = [
    { 
      type: 'source', 
      position: Position.Right, 
      id: 'output',
      className: 'text-node-handle'
    },
    ...variables.map((variable, index) => ({
      type: 'target',
      position: Position.Left,
      id: variable,
      className: 'text-node-handle',
      style: { 
        top: `${(index + 1) * (100 / (variables.length + 1))}%` 
      }
    }))
  ];

  useEffect(() => {
    updateNodeInternals(id);
  }, [handles.length, id, updateNodeInternals]);

  useEffect(() => {
    const reactFlowEdges = getEdges();
    
    if (!reactFlowEdges) return;
    
    const currentVariables = new Set(variables);
    const edgesToRemove = reactFlowEdges.filter(edge => {
      if (edge.target === id) {
        const handleId = edge.targetHandle;
        if (handleId && handleId !== 'output') {
          return !currentVariables.has(handleId);
        }
      }
      return false;
    });

    if (edgesToRemove.length > 0) {
      edgesToRemove.forEach(edge => {
        onEdgesChange([{ id: edge.id, type: 'remove' }]);
      });
    }
  }, [variables, id, getEdges, onEdgesChange]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setTextAreaValue(newValue);
    setCurrText(newValue);
    
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    const lastCloseBrace = textBeforeCursor.lastIndexOf('}}');
    
    if (lastOpenBrace !== -1 && (lastCloseBrace === -1 || lastOpenBrace > lastCloseBrace)) {
      const currentVariable = textBeforeCursor.substring(lastOpenBrace + 2);
      const allSuggestions = availableInputs.map(input => ({
        display: input,
        unique: input,
        fullMatch: `{{${input}}}`
      }));
      
      const filteredSuggestions = allSuggestions.filter(suggestion => 
        suggestion.display.toLowerCase().includes(currentVariable.toLowerCase())
      );
      
      if (filteredSuggestions.length > 0) {
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(0);
        
        const textarea = textareaRef.current;
        if (textarea) {
          const textareaStyles = window.getComputedStyle(textarea);
          const lineHeight = parseInt(textareaStyles.lineHeight);
          const paddingTop = parseInt(textareaStyles.paddingTop);
          const paddingLeft = parseInt(textareaStyles.paddingLeft);
          
          const lines = textBeforeCursor.split('\n');
          setSuggestionPosition({
            top: (lines.length - 1) * lineHeight + paddingTop + lineHeight,
            left: paddingLeft + (currentVariable.length * 8)
          });
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textAreaValue.substring(0, cursorPos);
    const textAfterCursor = textAreaValue.substring(cursorPos);
    
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    if (lastOpenBrace === -1) return;
    
    const newTextBefore = textBeforeCursor.substring(0, lastOpenBrace + 2) + suggestion.unique;
    const newText = newTextBefore + '}}' + textAfterCursor;
    
    setTextAreaValue(newText);
    setCurrText(newText);
    setShowSuggestions(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newTextBefore.length + suggestion.unique.length + 2, newTextBefore.length + suggestion.unique.length + 2);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === '{') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      const newValue = value.substring(0, start) + '{{' + value.substring(end);
      setTextAreaValue(newValue);
      setCurrText(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
      
      e.preventDefault();
    }
    
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (suggestions[selectedSuggestionIndex]) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = getComputedStyle(textarea).font;
      const textWidth = context.measureText(textarea.value).width;
      const currentWidth = textarea.offsetWidth;
      const threshold = currentWidth * 0.7;
      
      if (textWidth >= threshold) {
        const newWidth = Math.min(currentWidth + 50, 600);
        textarea.style.width = newWidth + 'px';
      }
    }
  }, [textAreaValue]);

  const calculateHeight = () => {
    const lineCount = (textAreaValue.match(/\n/g) || []).length + 1;
    const baseHeight = 120;
    const extraHeight = Math.max(0, (lineCount - 1) * 25);
    return Math.min(baseHeight + extraHeight, 500);
  };

  const nodeHeight = calculateHeight();

  return (
    <BaseNode 
      id={id} 
      data={data} 
      title="Text" 
      handles={handles}
      style={{ 
        minWidth: '280px',
        maxWidth: '600px',
        minHeight: nodeHeight,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <label style={{ flexShrink: 0, fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '500' }}>
        Text:
      </label>
      <div style={{ position: 'relative', flex: 1 }}>
        <textarea 
          ref={textareaRef}
          value={textAreaValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            minHeight: '80px',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '12px',
            padding: '6px',
            border: '1px solid #475569',
            borderRadius: '4px',
            flex: '1',
            overflow: 'hidden',
            background: '#334155',
            color: '#f8fafc',
            transition: 'width 0.2s ease'
          }}
          placeholder="Enter text. Type { to automatically get {{ and see available nodes"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            style={{
              position: 'absolute',
              top: `${suggestionPosition.top}px`,
              left: `${suggestionPosition.left}px`,
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              minWidth: '150px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${id}-suggestion-${suggestion.unique}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #334155',
                  background: index === selectedSuggestionIndex ? '#3b82f6' : 'transparent',
                  color: index === selectedSuggestionIndex ? 'white' : '#cbd5e1',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                <span>{suggestion.display}</span>
                <span style={{ 
                  fontSize: '10px', 
                  opacity: 0.7,
                  color: index === selectedSuggestionIndex ? '#e5e7eb' : '#94a3b8'
                }}>
                  {suggestion.unique}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {availableInputs.length > 0 && (
        <div style={{ 
          fontSize: '10px', 
          color: '#94a3b8', 
          marginTop: '6px',
          flexShrink: 0
        }}>
          Available inputs: {availableInputs.map(input => `{{${input}}}`).join(', ')}
        </div>
      )}
      
      <div style={{ 
        fontSize: '10px', 
        color: '#64748b', 
        marginTop: '4px',
        flexShrink: 0
      }}>
        Type {`{`} to start a node reference
      </div>
    </BaseNode>
  );
};