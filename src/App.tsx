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
import { Play, Download, Trash2, BookOpen, Upload, Menu, Undo, Redo, X, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

import { ComponentLibrary } from './components/ComponentLibrary';
import { CustomNode } from './components/CustomNode';
import { DrawingToolbar } from './components/DrawingToolbar';
import { DrawingCanvas } from './components/DrawingCanvas';
import { RobotAssistant } from './components/RobotAssistant';
import { ComponentData, AnalysisResult } from './types';
import { DrawingTool, DrawnShape } from './types/drawing';
import { generateExperimentJSON, downloadJSON } from './utils/jsonGenerator';
import { geminiService } from './utils/geminiService';
import { EXAMPLE_EXPERIMENTS, EXAMPLE_LIST } from './data/exampleExperiments';
import { shapeRecognizer } from './utils/shapeRecognition';
import { useUndoRedo } from './hooks/useUndoRedo';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo();
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [currentDrawingTool, setCurrentDrawingTool] = useState<DrawingTool | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

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
      takeSnapshot(nodes, edges);
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#3b82f6', 
          strokeWidth: 2.5,
          strokeLinecap: 'round',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, takeSnapshot, nodes, edges]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const label = prompt('Enter a label for this connection (e.g., condition, value):', edge.label as string || '');
      if (label !== null) {
        takeSnapshot(nodes, edges);
        setEdges((eds) =>
          eds.map((e) => (e.id === edge.id ? { ...e, label } : e))
        );
      }
    },
    [setEdges, takeSnapshot, nodes, edges]
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot(nodes, edges);
  }, [takeSnapshot, nodes, edges]);

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

      takeSnapshot(nodes, edges);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, takeSnapshot, nodes, edges]
  );

  const handleRunExperiment = async () => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!envApiKey) {
      alert('Please set VITE_GEMINI_API_KEY in your .env file');
      return;
    }

    if (nodes.length === 0) {
      alert('Please add components to your experiment first!');
      return;
    }

    setIsAnalyzing(true);
    setShowResults(true);
    setAnalysisResult(null);

    try {
      geminiService.setApiKey(envApiKey);
      const experimentJSON = generateExperimentJSON(nodes, edges);
      const result = await geminiService.analyzeExperiment(experimentJSON);
      setAnalysisResult(result);

      if (result.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
        });
      }
    } catch (error: any) {
      setAnalysisResult({
        success: false,
        title: "System Error",
        message: error.message || "An unexpected error occurred",
        mistake: "Failed to communicate with AI service",
        explanation: "Please check your API key and internet connection."
      });
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
      takeSnapshot(nodes, edges);
      setNodes([]);
      setEdges([]);
      setAnalysisResult(null);
      setShowResults(false);
    }
  };

  const handleLoadExample = (exampleId: string) => {
    const example = EXAMPLE_EXPERIMENTS[exampleId];
    if (example) {
      takeSnapshot(nodes, edges);
      setNodes(example.nodes as Node[]);
      setEdges(example.edges as Edge[]);
      setShowExamplesModal(false);
      setAnalysisResult(null);
      setShowResults(false);
    }
  };

  const handleShapeComplete = useCallback((shape: DrawnShape) => {
    const newNode = shapeRecognizer.convertShapeToNode(shape, shape.label);
    takeSnapshot(nodes, edges);
    setNodes((nds) => nds.concat(newNode as Node));
    setCurrentDrawingTool(null);
  }, [setNodes, takeSnapshot, nodes, edges]);

  const handleToolSelect = useCallback((tool: DrawingTool | null) => {
    if (!tool) {
      setCurrentDrawingTool(null);
      return;
    }

    // Get canvas center position
    const canvasCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    // Prompt for label
    const label = prompt(`Enter a label for this ${tool}:`, tool.charAt(0).toUpperCase() + tool.slice(1));
    
    if (!label || !label.trim()) {
      return;
    }

    // Create shape directly at center
    const size = 100;
    let points: any[] = [];
    let bounds = { x: canvasCenter.x - size/2, y: canvasCenter.y - size/2, width: size, height: size };

    switch (tool) {
      case 'rectangle':
        points = [
          { x: bounds.x, y: bounds.y },
          { x: bounds.x + size, y: bounds.y },
          { x: bounds.x + size, y: bounds.y + size },
          { x: bounds.x, y: bounds.y + size },
          { x: bounds.x, y: bounds.y },
        ];
        break;
      case 'circle':
        points = [];
        for (let i = 0; i <= 32; i++) {
          const angle = (i / 32) * 2 * Math.PI;
          points.push({
            x: canvasCenter.x + (size/2) * Math.cos(angle),
            y: canvasCenter.y + (size/2) * Math.sin(angle),
          });
        }
        break;
      case 'triangle':
        points = [
          { x: canvasCenter.x, y: bounds.y },
          { x: bounds.x + size, y: bounds.y + size },
          { x: bounds.x, y: bounds.y + size },
          { x: canvasCenter.x, y: bounds.y },
        ];
        break;
      case 'line':
        points = [
          { x: bounds.x, y: canvasCenter.y },
          { x: bounds.x + size, y: canvasCenter.y },
        ];
        break;
      case 'arrow':
        points = [
          { x: bounds.x, y: canvasCenter.y },
          { x: bounds.x + size, y: canvasCenter.y },
        ];
        break;
      case 'freehand':
        // Only freehand requires drawing
        setCurrentDrawingTool(tool);
        return;
    }

    const shape: DrawnShape = {
      id: `shape_${Date.now()}`,
      type: tool as any,
      points,
      bounds,
      label: label.trim(),
      recognized: true,
    };

    const newNode = shapeRecognizer.convertShapeToNode(shape, shape.label);
    takeSnapshot(nodes, edges);
    setNodes((nds) => nds.concat(newNode as Node));
  }, [setNodes, takeSnapshot, nodes, edges]);

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
              takeSnapshot(nodes, edges);
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

  const handleRequestHint = async (userMessage: string): Promise<string> => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!envApiKey) {
      return "Oops! I need an API key to help you. Please configure VITE_GEMINI_API_KEY in your .env file. 🔑";
    }

    try {
      geminiService.setApiKey(envApiKey);
      const experimentJSON = generateExperimentJSON(nodes, edges);
      const hint = await geminiService.getHint(experimentJSON, userMessage);
      return hint;
    } catch (error: any) {
      return "Sorry, I'm having trouble thinking right now. Can you try asking again? 🤔";
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Component Library Sidebar */}
      <ComponentLibrary onDragStart={() => {}} />

      {/* Main Canvas */}
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
        <DrawingToolbar 
          selectedTool={currentDrawingTool} 
          onToolSelect={handleToolSelect}
        />
        
        <DrawingCanvas 
          currentTool={currentDrawingTool}
          onShapeComplete={handleShapeComplete}
        />
        
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
          onNodeDragStart={onNodeDragStart}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Background 
            color="#e5e7eb" 
            gap={20} 
            size={1}
            style={{ backgroundColor: '#f9fafb' }}
          />
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
              <div style={{ display: 'flex', gap: '4px', marginRight: '8px', borderRight: '1px solid #e5e7eb', paddingRight: '8px' }}>
                <button
                  onClick={() => undo(nodes, edges, setNodes, setEdges)}
                  disabled={!canUndo}
                  title="Undo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    color: canUndo ? '#374151' : '#d1d5db',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: canUndo ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => canUndo && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Undo size={18} />
                </button>
                <button
                  onClick={() => redo(nodes, edges, setNodes, setEdges)}
                  disabled={!canRedo}
                  title="Redo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    color: canRedo ? '#374151' : '#d1d5db',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: canRedo ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => canRedo && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Redo size={18} />
                </button>
              </div>

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

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
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
                  <Menu size={16} />
                </button>

                {showSettingsMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '160px',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => {
                        handleDownloadJSON();
                        setShowSettingsMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#374151',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Download size={16} />
                      Export JSON
                    </button>
                    <button
                      onClick={() => {
                        handleImportJSON();
                        setShowSettingsMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#374151',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Upload size={16} />
                      Import JSON
                    </button>
                    <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }} />
                    <button
                      onClick={() => {
                        handleClearCanvas();
                        setShowSettingsMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#ef4444',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={16} />
                      Clear Canvas
                    </button>
                  </div>
                )}
              </div>
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
             
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '90%',
            height: '90%',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: analysisResult?.success ? '#f0fdf4' : (analysisResult ? '#fef2f2' : 'white'),
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {analysisResult ? (
                  analysisResult.success ? (
                    <CheckCircle size={32} color="#10b981" />
                  ) : (
                    <AlertCircle size={32} color="#ef4444" />
                  )
                ) : (
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: '3px solid #e5e7eb', 
                    borderTopColor: '#3b82f6', 
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                    {analysisResult ? analysisResult.title : 'Analyzing Experiment...'}
                  </h2>
                  {analysisResult && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      {analysisResult.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowResults(false)}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px',
              display: 'flex',
              gap: '30px',
              backgroundColor: '#f9fafb',
            }}>
              {analysisResult ? (
                <>
                  {/* Left Column: Explanation / Mistake */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {analysisResult.success ? (
                      <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}>
                        <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🎉 Congratulations!
                        </h3>
                        <div style={{ fontSize: '16px', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>
                          {analysisResult.explanation}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #fecaca',
                      }}>
                        <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ❌ Experiment Failed
                        </h3>
                        <div style={{ fontSize: '16px', lineHeight: 1.6, color: '#991b1b' }}>
                          <strong>Mistake:</strong> {analysisResult.mistake}
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '14px', color: '#7f1d1d', fontStyle: 'italic' }}>
                          Review your connections and component properties to fix the issue.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Visualization */}
                  {analysisResult.success && analysisResult.svg && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#374151' }}>
                          Visual Output
                        </h3>
                        <div 
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}
                          dangerouslySetInnerHTML={{ __html: analysisResult.svg }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    border: '6px solid #e5e7eb', 
                    borderTopColor: '#3b82f6', 
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{ fontSize: '18px', color: '#6b7280', fontWeight: 500 }}>Processing your experiment...</div>
                </div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
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
              Welcome to AI Experiment Lab!
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
                <strong>Important:</strong> You'll need a Google Gemini API key to run experiments.
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
                <div style={{ marginBottom: '4px', color: '#3b82f6' }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Electronics</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>300+ components</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
              }}>
                <div style={{ marginBottom: '4px', color: '#10b981' }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg></div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Chemistry</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>200+ components</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#faf5ff',
                borderRadius: '8px',
              }}>
                <div style={{ marginBottom: '4px', color: '#8b5cf6' }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg></div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Physics</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>250+ components</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
              }}>
                <div style={{ marginBottom: '4px', color: '#f59e0b' }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
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

      {/* Robot Assistant Chatbot */}
      <RobotAssistant 
        experimentJSON={generateExperimentJSON(nodes, edges)}
        onRequestHint={handleRequestHint}
      />
    </div>
  );
}

export default App;
