import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { HeaderParticles } from './HeaderParticles';
import { useCallback, useEffect } from 'react';
import { useStore } from './store';
import './App.css';

function App() {
  const { nodes, edges } = useStore();

 
  const handleAnalyzePipeline = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to the pipeline before analyzing.');
      return;
    }

    try {
      const pipelineData = {
        nodes: nodes,
        edges: edges
      };

      console.log('Sending pipeline data:', pipelineData);

      const response = await fetch('/api/pipelines/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineData),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      
      alert(
        `Pipeline Analysis Results:\n\n` +
        `Number of Nodes: ${result.num_nodes}\n` +
        `Number of Edges: ${result.num_edges}\n` +
        `Is Valid DAG: ${result.is_dag ? 'Yes ✅' : 'No ❌'}\n\n` +
        `${result.is_dag ? 
          'Your pipeline is valid! (No cycles detected)' : 
          'Warning: Your pipeline contains cycles!'}`
      );

      console.log('Backend response:', result);

    } catch (error) {
      console.error('Error submitting pipeline:', error);
      alert(
        `Error connecting to backend:\n${error.message}\n\n` +
        `Make sure the backend server is running on api`
      );
    }
  }, [nodes, edges]); 

  
  useEffect(() => {
    const handleKeyDown = (event) => {
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        console.log('⌨️ Global keyboard shortcut triggered: Ctrl+Enter / Cmd+Enter');
        handleAnalyzePipeline();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleAnalyzePipeline]); 

  return (
    <div className="app-container">
      
      <header className="app-header">
        <HeaderParticles />
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo">⚡</span>
            VectorShift Pipeline Editor
          </h1>
          <div className="header-subtitle">⚡️ Build AI workflows visually</div>
        </div>
      </header>

      
      <div className="app-main">
        
        <aside className="app-sidebar">
          <PipelineToolbar />
        </aside>
        
        
        <div className="canvas-container">
          <main className="app-canvas">
            <PipelineUI />
          </main>
          
          <footer className="app-footer">
            <SubmitButton />
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;