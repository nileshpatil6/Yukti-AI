import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './components/CustomNode';
import { ComponentLibrary } from './components/ComponentLibrary';
import { DrawingToolbar } from './components/DrawingToolbar';
import { DrawingCanvas } from './components/DrawingCanvas';
import { RobotAssistant } from './components/RobotAssistant';
import { analyzeExperiment, getHint } from './utils/geminiService';
import { AnalysisResult } from './types';
import { DrawingTool } from './types/drawing';
import confetti from 'canvas-confetti';

const nodeTypes = {
  custom: CustomNode,
};

// Challenge Mode Types
type ChallengeType = 'scrambled' | 'blank';

interface Challenge {
  type: ChallengeType;
  topic: string;
  question: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialNodes?: Node[];
  initialEdges?: Edge[];
  targetSetup: {
    components: string[];
    connections: Array<{ from: string; to: string }>;
  };
}

function App_Challenge() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<DrawingTool | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Challenge-specific state
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  // Sample challenges (in production, these would come from API)
  const sampleChallenges: Challenge[] = [
    {
      type: 'scrambled',
      topic: 'Electronics',
      question: 'Build a simple LED circuit',
      description: 'Arrange the scrambled components to create a working LED circuit with a battery and resistor.',
      difficulty: 'easy',
      initialNodes: [
        { id: '1', type: 'custom', position: { x: 450, y: 100 }, data: { label: 'LED', category: 'Electronics' } },
        { id: '2', type: 'custom', position: { x: 150, y: 300 }, data: { label: 'Battery', category: 'Electronics' } },
        { id: '3', type: 'custom', position: { x: 350, y: 450 }, data: { label: 'Resistor', category: 'Electronics' } },
      ],
      initialEdges: [],
      targetSetup: {
        components: ['Battery', 'Resistor', 'LED'],
        connections: [
          { from: 'Battery', to: 'Resistor' },
          { from: 'Resistor', to: 'LED' }
        ]
      }
    },
    {
      type: 'blank',
      topic: 'Physics',
      question: 'Demonstrate Newton\'s Second Law',
      description: 'Build an experiment that demonstrates F = ma using the available components.',
      difficulty: 'medium',
      targetSetup: {
        components: ['Force Sensor', 'Mass', 'Accelerometer'],
        connections: [
          { from: 'Force Sensor', to: 'Mass' },
          { from: 'Mass', to: 'Accelerometer' }
        ]
      }
    }
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const category = event.dataTransfer.getData('category');

      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 50,
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: { label, category },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleToolSelect = (tool: DrawingTool | null) => {
    setSelectedTool(tool === selectedTool ? null : tool);
  };

  const handleRunExperiment = async () => {
    if (nodes.length === 0) {
      alert('Please add some components to your experiment first!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeExperiment(nodes, edges);
      setAnalysisResult(result);

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze experiment. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestHint = async (userMessage: string): Promise<string> => {
    const experimentContext = {
      nodes: nodes.map(n => ({ id: n.id, label: n.data.label, category: n.data.category })),
      edges: edges.map(e => ({ source: e.source, target: e.target })),
      challenge: currentChallenge,
      componentCount: nodes.length,
      edgeCount: edges.length,
      categories: [...new Set(nodes.map(n => n.data.category))],
    };

    return await getHint(userMessage, experimentContext);
  };

  const loadChallenge = async (challengeIndex: number) => {
    const challenge = sampleChallenges[challengeIndex];

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setCurrentChallenge(challenge);

    if (challenge.type === 'scrambled' && challenge.initialNodes && challenge.initialEdges) {
      setNodes(challenge.initialNodes);
      setEdges(challenge.initialEdges);
    } else {
      // Blank canvas
      setNodes([]);
      setEdges([]);
    }
  };

  const exitChallenge = () => {
    setCurrentChallenge(null);
    setNodes([]);
    setEdges([]);
    setAnalysisResult(null);
  };

  // Challenge Selection Screen
  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <h1 className="font-serif text-6xl text-zinc-950 dark:text-white mb-6 text-center">
            Challenge Mode
          </h1>
          <p className="font-sans text-xl text-zinc-600 dark:text-zinc-400 text-center mb-16 max-w-3xl mx-auto">
            Test your understanding through guided challenges. AI provides hints without giving away solutions.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {sampleChallenges.map((challenge, idx) => (
              <div
                key={idx}
                className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:border-accent/30 transition-all duration-500 cursor-pointer group"
                onClick={() => loadChallenge(idx)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm text-accent">
                    {challenge.type === 'scrambled' ? 'TYPE A: SCRAMBLED' : 'TYPE B: BLANK CANVAS'}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${challenge.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                    }`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-zinc-950 dark:text-white mb-3">
                  {challenge.question}
                </h3>
                <p className="font-sans text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-zinc-500 dark:text-zinc-600">
                    {challenge.topic}
                  </span>
                  <button className="px-6 py-2 bg-accent text-white rounded-lg font-sans font-medium group-hover:bg-accent/90 transition-colors duration-500">
                    Start Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Challenge Canvas Screen
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Challenge Header */}
      <div className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-white mb-1">
              {currentChallenge.question}
            </h2>
            <p className="font-sans text-sm text-zinc-400">
              {currentChallenge.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRunExperiment}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-accent text-white font-sans font-medium rounded-lg hover:bg-accent/90 transition-all duration-500 disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Submit Solution'}
            </button>
            <button
              onClick={() => setIsAssistantOpen(!isAssistantOpen)}
              className="px-6 py-3 bg-zinc-800 text-white font-sans font-medium rounded-lg hover:bg-zinc-700 transition-all duration-500"
            >
              Get Hint
            </button>
            <button
              onClick={exitChallenge}
              className="px-6 py-3 bg-zinc-800 text-white font-sans font-medium rounded-lg hover:bg-zinc-700 transition-all duration-500"
            >
              Exit Challenge
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zinc-950"
        >
          <Background color="#27272a" gap={20} />
          <Controls className="bg-zinc-900 border-zinc-800" />
          <MiniMap
            nodeColor="#ff4f00"
            maskColor="rgba(0, 0, 0, 0.6)"
            className="bg-zinc-900 border border-zinc-800"
          />
        </ReactFlow>

        <DrawingCanvas
          currentTool={selectedTool}
          onShapeComplete={(shape: any) => {
            const newNode: Node = {
              id: `${Date.now()}`,
              type: 'custom',
              position: { x: shape.bounds.x, y: shape.bounds.y },
              data: { label: shape.label, category: 'Drawing' },
            };
            setNodes((nds) => nds.concat(newNode));
            setSelectedTool(null);
          }}
        />

        <ComponentLibrary
          onDragStart={() => {
            // Handle drag start if needed
          }}
        />

        <DrawingToolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
        />

        <button
          onClick={() => setIsLibraryOpen(!isLibraryOpen)}
          className="absolute top-4 left-4 z-10 px-6 py-3 bg-zinc-900/80 backdrop-blur-md text-white border border-zinc-800 rounded-lg font-sans font-medium hover:border-accent/30 transition-all duration-500"
        >
          {isLibraryOpen ? 'Close' : 'Open'} Library
        </button>
      </div>

      {/* Robot Assistant */}
      {isAssistantOpen && (
        <RobotAssistant
          experimentJSON={{} as any}
          onRequestHint={handleRequestHint}
        />
      )}

      {/* Results Modal */}
      {analysisResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-10">
            <div className="text-center mb-8">
              <h2 className="font-serif text-4xl text-white mb-4">
                {analysisResult.success ? 'Challenge Complete!' : 'Not Quite Right'}
              </h2>
              <p className="font-sans text-xl text-zinc-400">
                {analysisResult.title}
              </p>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 mb-6">
              <p className="font-sans text-zinc-300 leading-relaxed">
                {analysisResult.message}
              </p>
            </div>

            {!analysisResult.success && analysisResult.mistake && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 mb-6">
                <h3 className="font-serif text-xl text-red-400 mb-3">What went wrong</h3>
                <p className="font-sans text-red-300/80 leading-relaxed">
                  {analysisResult.mistake}
                </p>
              </div>
            )}

            {analysisResult.explanation && (
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 mb-6">
                <h3 className="font-serif text-xl text-white mb-3">Explanation</h3>
                <p className="font-sans text-zinc-400 leading-relaxed">
                  {analysisResult.explanation}
                </p>
              </div>
            )}

            {analysisResult.svg && (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
                <div dangerouslySetInnerHTML={{ __html: analysisResult.svg }} />
              </div>
            )}

            <button
              onClick={() => setAnalysisResult(null)}
              className="w-full px-6 py-4 bg-accent text-white font-sans font-medium rounded-lg hover:bg-accent/90 transition-all duration-500"
            >
              {analysisResult.success ? 'Next Challenge' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App_Challenge;
