import { useStore } from './store';
import './Submit.css';

export const SubmitButton = () => {
  const { nodes, edges } = useStore();

  const handleSubmit = async () => {
    try {
      
      const pipelineData = {
        nodes: nodes,
        edges: edges
      };

      console.log('Sending pipeline data:', pipelineData);

      
      const response = await fetch('http://localhost:8000/pipelines/parse', {
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
        `Make sure the backend server is running on http://localhost:8000`
      );
    }
  };

  
  const handleClick = () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to the pipeline before analyzing.');
      return;
    }
    handleSubmit();
  };

  return (
    <div className="submit-container">
      <div className="pipeline-stats">
        <div className="stat">
          <span className="stat-label">Nodes</span>
          <span className="stat-value">{nodes.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Edges</span>
          <span className="stat-value">{edges.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Status</span>
          <span className={`stat-value ${nodes.length > 0 ? 'status-active' : 'status-idle'}`}>
            {nodes.length > 0 ? 'Active' : 'Idle'}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleClick} 
        className="submit-button"
        
      >
        <span className="button-icon">🚀</span>
        Analyze Pipeline
        <span className="button-shortcut">Ctrl+Enter</span>
      </button>
    </div>
  );
};
