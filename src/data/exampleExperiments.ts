import { ExperimentJSON } from '../types';

export const EXAMPLE_EXPERIMENTS: Record<string, ExperimentJSON> = {
  simpleCircuit: {
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: 'Power Source 5V USB',
          component: {
            id: 'power_5',
            label: 'Power Source 5V USB',
            category: 'electronics',
            description: 'Electrical power supply',
            icon: '🔋',
            properties: { voltage: 5, type: 'supply' },
            inputs: 0,
            outputs: 1,
          },
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 350, y: 100 },
        data: {
          label: 'Resistor 220Ω',
          component: {
            id: 'resistor_220',
            label: 'Resistor 220Ω',
            category: 'electronics',
            description: 'Electrical resistance component',
            icon: '⚡',
            properties: { resistance: 220, unit: 'Ω' },
            inputs: 1,
            outputs: 1,
          },
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 600, y: 100 },
        data: {
          label: 'LED Red',
          component: {
            id: 'diode_led_red',
            label: 'LED Red',
            category: 'electronics',
            description: 'One-way current flow',
            icon: '▶',
            properties: { type: 'led', color: 'red' },
            inputs: 1,
            outputs: 0,
          },
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        label: '+5V',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: '22.7mA',
      },
    ],
    metadata: {
      title: 'Simple LED Circuit',
      description: 'A basic circuit with a power source, resistor, and LED',
      created: new Date().toISOString(),
    },
  },

  chemicalReaction: {
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: 'Hydrochloric Acid (HCl)',
          component: {
            id: 'acid_hcl',
            label: 'Hydrochloric Acid (HCl)',
            category: 'chemicals',
            description: 'Acidic compound',
            icon: '🧪',
            properties: { formula: 'HCl', pH: 1 },
            inputs: 0,
            outputs: 1,
          },
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 100, y: 250 },
        data: {
          label: 'Sodium Hydroxide (NaOH)',
          component: {
            id: 'base_naoh',
            label: 'Sodium Hydroxide (NaOH)',
            category: 'chemicals',
            description: 'Basic compound',
            icon: '🧪',
            properties: { formula: 'NaOH', pH: 14 },
            inputs: 0,
            outputs: 1,
          },
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 400, y: 175 },
        data: {
          label: 'Beaker 250ml',
          component: {
            id: 'beaker_250',
            label: 'Beaker 250ml',
            category: 'chemicals',
            description: 'Laboratory equipment',
            icon: '🔬',
            properties: { type: 'beaker', volume: 250 },
            inputs: 2,
            outputs: 1,
          },
        },
      },
    ],
    edges: [
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        label: 'HCl',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'NaOH',
      },
    ],
    metadata: {
      title: 'Acid-Base Neutralization',
      description: 'Mixing hydrochloric acid with sodium hydroxide',
      created: new Date().toISOString(),
    },
  },

  pendulumPhysics: {
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: {
          label: 'Pendulum',
          component: {
            id: 'pendulum',
            label: 'Pendulum',
            category: 'physics',
            description: 'Mechanical component',
            icon: '⚙️',
            properties: { type: 'pendulum', length: 1 },
            inputs: 1,
            outputs: 1,
          },
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 250, y: 200 },
        data: {
          label: 'Mass 1kg',
          component: {
            id: 'mass_1kg',
            label: 'Mass 1kg',
            category: 'physics',
            description: 'Mechanical component',
            icon: '⚙️',
            properties: { type: 'mass', value: 1, unit: 'kg' },
            inputs: 1,
            outputs: 1,
          },
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: {
          label: 'Gravity 9.8m/s²',
          component: {
            id: 'gravity',
            label: 'Gravity 9.8m/s²',
            category: 'physics',
            description: 'Force vector',
            icon: '➡️',
            properties: { type: 'gravity', value: 9.8 },
            inputs: 0,
            outputs: 1,
          },
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        label: 'attached',
      },
      {
        id: 'e3-2',
        source: '3',
        target: '2',
        label: 'force',
      },
    ],
    metadata: {
      title: 'Simple Pendulum',
      description: 'Physics simulation of a pendulum under gravity',
      created: new Date().toISOString(),
    },
  },

  logicFlow: {
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 150 },
        data: {
          label: 'Number Variable',
          component: {
            id: 'var_number',
            label: 'Variable Number',
            category: 'coding',
            description: 'Data storage',
            icon: '📦',
            properties: { type: 'number', value: 10 },
            inputs: 1,
            outputs: 1,
          },
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 350, y: 150 },
        data: {
          label: 'Compare > 5',
          component: {
            id: 'compare_gt',
            label: 'Compare Greater >',
            category: 'coding',
            description: 'Comparison operator',
            icon: '⚖️',
            properties: { operator: '>', symbol: '>' },
            inputs: 2,
            outputs: 1,
          },
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 600, y: 150 },
        data: {
          label: 'If Statement',
          component: {
            id: 'if_statement',
            label: 'If Statement',
            category: 'coding',
            description: 'Control flow',
            icon: '🔀',
            properties: { type: 'if' },
            inputs: 1,
            outputs: 2,
          },
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        label: 'value',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'condition',
      },
    ],
    metadata: {
      title: 'Conditional Logic Flow',
      description: 'Programming logic with variables and conditions',
      created: new Date().toISOString(),
    },
  },
};

export const EXAMPLE_LIST = [
  { id: 'simpleCircuit', name: 'Simple LED Circuit', category: 'Electronics' },
  { id: 'chemicalReaction', name: 'Acid-Base Neutralization', category: 'Chemistry' },
  { id: 'pendulumPhysics', name: 'Simple Pendulum', category: 'Physics' },
  { id: 'logicFlow', name: 'Conditional Logic Flow', category: 'Coding' },
];
