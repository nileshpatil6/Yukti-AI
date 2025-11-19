import { useState, useCallback, useRef, DragEvent, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Node,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Download, Settings, Trash2, BookOpen, Upload, Paintbrush } from 'lucide-react';

import { ComponentLibrary } from './components/ComponentLibrary';
import { CustomNode } from './components/CustomNode';
import { DrawingCanvas } from './components/DrawingCanvas';
import { DrawingToolbar } from './components/DrawingToolbar';
import { ComponentData } from './types';
import { DrawingSettings } from './types/drawing';
import { generateExperimentJSON, downloadJSON } from './utils/jsonGenerator';
import { geminiService } from './utils/geminiService';
import { EXAMPLE_EXPERIMENTS, EXAMPLE_LIST } from './data/exampleExperiments';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [showResults, setShowResults] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Drawing mode state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    tool: 'pencil',
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    brushSize: 20,
    fontSize: 20,
    fontFamily: 'Arial',
    opacity: 1,
  });

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem('aiexp-visited');
    if (hasVisited) {
      setShowWelcomeModal(false);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem('aiexp-visited', 'true');
    setShowWelcomeModal(false);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'default',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const label = prompt('Enter a label for this connection (e.g., condition, value):', edge.label as string || '');
      if (label !== null) {
        setEdges((eds) =>
          eds.map((e) => (e.id === edge.id ? { ...e, label } : e))
        );
      }
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const componentData = event.dataTransfer.getData('application/reactflow');
      if (!componentData) return;

      const component: ComponentData = JSON.parse(componentData);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${component.id}_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: component.label,
          component,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleRunExperiment = async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (nodes.length === 0) {
      alert('Please add components to your experiment first!');
      return;
    }

    setIsAnalyzing(true);
    setShowResults(true);
    setAnalysisResult('🔬 Analyzing your experiment...\n\nPlease wait while AI processes your experimental setup.');

    try {
      geminiService.setApiKey(apiKey);
      const experimentJSON = generateExperimentJSON(nodes, edges);
      const result = await geminiService.analyzeExperiment(experimentJSON);
      setAnalysisResult(result);
    } catch (error: any) {
      setAnalysisResult(`❌ Error: ${error.message}\n\nPlease check:\n- Your API key is valid\n- You have internet connection\n- The Gemini API is accessible`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadJSON = () => {
    if (nodes.length === 0) {
      alert('Please add components to your experiment first!');
      return;
    }
    const experimentJSON = generateExperimentJSON(nodes, edges);
    downloadJSON(experimentJSON);
  };

  const handleClearCanvas = () => {
    if (nodes.length > 0 && confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
      setAnalysisResult('');
      setShowResults(false);
    }
  };

  const handleLoadExample = (exampleId: string) => {
    const example = EXAMPLE_EXPERIMENTS[exampleId];
    if (example) {
      setNodes(example.nodes as Node[]);
      setEdges(example.edges as Edge[]);
      setShowExamplesModal(false);
      setAnalysisResult('');
      setShowResults(false);
    }
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            if (json.nodes && json.edges) {
              setNodes(json.nodes);
              setEdges(json.edges);
              alert('Experiment loaded successfully!');
            } else {
              alert('Invalid experiment file format!');
            }
          } catch (error) {
            alert('Error reading file. Please make sure it\'s a valid JSON file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Component Library Sidebar - Hide when drawing */}
      {!isDrawingMode && <ComponentLibrary onDragStart={() => {}} />}

      {/* Main Canvas */}
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative', display: isDrawingMode ? 'none' : 'block' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Background />
          <Controls />
          <MiniMap />

          {/* Top Control Panel */}
          <Panel position="top-right" style={{ margin: '10px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: isDrawingMode ? '#f59e0b' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Paintbrush size={16} />
                {isDrawingMode ? 'Exit Drawing' : 'Drawing Mode'}
              </button>

              <button
                onClick={handleRunExperiment}
                disabled={isAnalyzing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: isAnalyzing ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Play size={16} />
                {isAnalyzing ? 'Analyzing...' : 'Run Experiment'}
              </button>

              <button
                onClick={() => setShowExamplesModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <BookOpen size={16} />
                Examples
              </button>

              <button
                onClick={handleDownloadJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Download size={16} />
                Export
              </button>

              <button
                onClick={handleImportJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#06b6d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Upload size={16} />
                Import
              </button>

              <button
                onClick={() => setShowApiKeyModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Settings size={16} />
                API Key
              </button>

              <button
                onClick={handleClearCanvas}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Trash2 size={16} />
                Clear
              </button>
            </div>
          </Panel>

          {/* Info Panel */}
          <Panel position="top-left" style={{ margin: '10px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxWidth: '300px',
            }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600 }}>
                AI Experiment Lab
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
                Drag components from the library, connect them, and run AI-powered simulations.
              </p>
              <div style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#374151',
              }}>
                <strong>{nodes.length}</strong> components • <strong>{edges.length}</strong> connections
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#9ca3af',
                lineHeight: 1.4,
              }}>
                💡 <strong>Tips:</strong><br />
                • Double-click nodes to edit<br />
                • Click edges to add labels<br />
                • Press Delete to remove items<br />
                • Use Drawing Mode for freehand sketches!
              </div>
            </div>
          </Panel>
        </ReactFlow>

        {/* Drawing Toolbar */}
        {isDrawingMode && (
          <DrawingToolbar
            settings={drawingSettings}
            onSettingsChange={setDrawingSettings}
            isDrawingMode={isDrawingMode}
            onDrawingModeToggle={() => setIsDrawingMode(!isDrawingMode)}
          />
        )}
      </div>

      {/* Full-Screen Drawing Mode */}
      {isDrawingMode && (
        <>
          <DrawingToolbar
            settings={drawingSettings}
            onSettingsChange={setDrawingSettings}
            isDrawingMode={isDrawingMode}
            onDrawingModeToggle={() => setIsDrawingMode(!isDrawingMode)}
          />
          <DrawingCanvas
            settings={drawingSettings}
            isDrawingMode={isDrawingMode}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </>
      )}

      {/* Results Panel */}
      {showResults && (
        <div style={{
          width: '400px',
          height: '100vh',
          backgroundColor: '#f9fafb',
          borderLeft: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Analysis Results
            </h2>
            <button
              onClick={() => setShowResults(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              fontFamily: 'system-ui, sans-serif',
            }}>
              {analysisResult}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 600 }}>
              Welcome to AI Experiment Lab! 🧪⚡
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>
              Build and simulate complex experiments using a visual canvas powered by AI.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>How to Use:</h3>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280', lineHeight: 1.8 }}>
                <li>Browse the <strong>1000+ components</strong> in the left sidebar</li>
                <li><strong>Drag components</strong> onto the canvas</li>
                <li><strong>Connect components</strong> by dragging from output (green) to input (blue)</li>
                <li><strong>Double-click nodes</strong> to edit their labels</li>
                <li><strong>Click connections</strong> to add labels/conditions</li>
                <li>Click <strong>"Drawing Mode"</strong> to draw shapes freehand (auto-corrects to perfect shapes!)</li>
                <li>Click <strong>"Run Experiment"</strong> to analyze with AI</li>
                <li><strong>Export/Import</strong> your experiments as JSON</li>
              </ol>
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                <strong>⚠️ Important:</strong> You'll need a Google Gemini API key to run experiments.
                Get one free at{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1d4ed8', textDecoration: 'underline' }}
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚡</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Electronics</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>300+ components</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚗️</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Chemistry</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>200+ components</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#faf5ff',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚙️</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Physics</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>250+ components</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>💻</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Coding</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>200+ components</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  handleCloseWelcome();
                  setShowExamplesModal(true);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                View Examples
              </button>
              <button
                onClick={handleCloseWelcome}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Examples Modal */}
      {showExamplesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>
              Example Experiments
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
              Load a pre-built experiment to get started quickly
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {EXAMPLE_LIST.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleLoadExample(example.id)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    {example.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {example.category}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExamplesModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>
              Configure Gemini API Key
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
              Enter your Google Gemini API key to enable AI-powered experiment analysis.
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6' }}
              >
                Google AI Studio
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (apiKey) {
                    geminiService.setApiKey(apiKey);
                    localStorage.setItem('aiexp-api-key', apiKey);
                    setShowApiKeyModal(false);
                    alert('API key saved successfully!');
                  } else {
                    alert('Please enter an API key');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
