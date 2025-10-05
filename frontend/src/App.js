
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import './App.css';

function App() {
  return (
    <div className="app-container">
      
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo">⚡</span>
            VectorShift Pipeline Editor
          </h1>
          <div className="header-subtitle">Build AI workflows visually</div>
        </div>
      </header>

      
      <div className="app-main">
        
        <aside className="app-sidebar">
          <div className="sidebar-header">
            <h3>Nodes</h3>
            <div className="sidebar-subtitle">Drag to canvas</div>
          </div>
          <PipelineToolbar />
        </aside>
        
        
        <main className="app-canvas">
          <PipelineUI />
        </main>
      </div>

      
      <footer className="app-footer">
        <SubmitButton />
      </footer>
    </div>
  );
}

export default App;