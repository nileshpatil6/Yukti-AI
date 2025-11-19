import { Node, Edge } from 'reactflow';
import { ExperimentJSON } from '../types';

export const generateExperimentJSON = (
  nodes: Node[],
  edges: Edge[],
  title: string = 'Untitled Experiment',
  description: string = ''
): ExperimentJSON => {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type || 'custom',
      position: node.position,
      data: {
        label: node.data.label,
        component: node.data.component,
        customText: node.data.customText,
        properties: node.data.properties || node.data.component.properties,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined,
      condition: edge.data?.condition,
    })),
    metadata: {
      title,
      description,
      created: new Date().toISOString(),
    },
  };
};

export const downloadJSON = (json: ExperimentJSON, filename: string = 'experiment.json') => {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
