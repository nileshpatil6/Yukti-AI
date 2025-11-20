export interface ComponentData {
  id: string;
  label: string;
  category: string;
  description: string;
  icon: string;
  properties: Record<string, any>;
  inputs?: number;
  outputs?: number;
}

export interface ExperimentNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    component: ComponentData;
    customText?: string;
    properties?: Record<string, any>;
  };
}

export interface ExperimentEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface ExperimentJSON {
  nodes: ExperimentNode[];
  edges: ExperimentEdge[];
  metadata: {
    title: string;
    description: string;
    created: string;
  };
}

export type CategoryType = 'electronics' | 'chemicals' | 'physics' | 'biology' | 'coding' | 'mathematics' | 'mechanics' | 'optics' | 'thermodynamics' | 'quantum';

export interface AnalysisResult {
  success: boolean;
  title: string;
  message: string;
  mistake?: string;
  explanation: string;
  svg?: string;
}
