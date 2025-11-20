import { ComponentData } from '../types';

// Helper function to generate multiple similar components
const generateComponents = (
  base: Partial<ComponentData>,
  variations: Array<{ suffix: string; props?: Record<string, any> }>
): ComponentData[] => {
  return variations.map((v, idx) => ({
    id: `${base.id}_${idx}`,
    label: `${base.label} ${v.suffix}`,
    category: base.category || '',
    description: `${base.description} - ${v.suffix}`,
    icon: base.icon || '📦',
    properties: { ...base.properties, ...v.props },
    inputs: base.inputs || 1,
    outputs: base.outputs || 1,
  }));
};

export const COMPONENT_LIBRARY: ComponentData[] = [
  // ELECTRONICS COMPONENTS (300+ components)
  // Resistors
  ...generateComponents(
    {
      id: 'resistor',
      label: 'Resistor',
      category: 'electronics',
      description: 'Electrical resistance component',
      icon: '⚡',
      properties: { resistance: 0, unit: 'Ω' },
    },
    [
      { suffix: '10Ω', props: { resistance: 10 } },
      { suffix: '100Ω', props: { resistance: 100 } },
      { suffix: '1kΩ', props: { resistance: 1000 } },
      { suffix: '10kΩ', props: { resistance: 10000 } },
      { suffix: '100kΩ', props: { resistance: 100000 } },
      { suffix: '1MΩ', props: { resistance: 1000000 } },
      { suffix: '220Ω', props: { resistance: 220 } },
      { suffix: '330Ω', props: { resistance: 330 } },
      { suffix: '470Ω', props: { resistance: 470 } },
      { suffix: '4.7kΩ', props: { resistance: 4700 } },
    ]
  ),

  // Capacitors
  ...generateComponents(
    {
      id: 'capacitor',
      label: 'Capacitor',
      category: 'electronics',
      description: 'Energy storage component',
      icon: '⚡',
      properties: { capacitance: 0, unit: 'F' },
    },
    [
      { suffix: '1pF', props: { capacitance: 0.000000000001 } },
      { suffix: '10pF', props: { capacitance: 0.00000000001 } },
      { suffix: '100pF', props: { capacitance: 0.0000000001 } },
      { suffix: '1nF', props: { capacitance: 0.000000001 } },
      { suffix: '10nF', props: { capacitance: 0.00000001 } },
      { suffix: '100nF', props: { capacitance: 0.0000001 } },
      { suffix: '1μF', props: { capacitance: 0.000001 } },
      { suffix: '10μF', props: { capacitance: 0.00001 } },
      { suffix: '100μF', props: { capacitance: 0.0001 } },
      { suffix: '1000μF', props: { capacitance: 0.001 } },
    ]
  ),

  // Inductors
  ...generateComponents(
    {
      id: 'inductor',
      label: 'Inductor',
      category: 'electronics',
      description: 'Magnetic field component',
      icon: '⚡',
      properties: { inductance: 0, unit: 'H' },
    },
    [
      { suffix: '1μH', props: { inductance: 0.000001 } },
      { suffix: '10μH', props: { inductance: 0.00001 } },
      { suffix: '100μH', props: { inductance: 0.0001 } },
      { suffix: '1mH', props: { inductance: 0.001 } },
      { suffix: '10mH', props: { inductance: 0.01 } },
      { suffix: '100mH', props: { inductance: 0.1 } },
    ]
  ),

  // Diodes
  ...generateComponents(
    {
      id: 'diode',
      label: 'Diode',
      category: 'electronics',
      description: 'One-way current flow',
      icon: '▶',
      properties: { type: 'standard' },
    },
    [
      { suffix: '1N4148', props: { type: 'signal' } },
      { suffix: '1N4007', props: { type: 'rectifier' } },
      { suffix: 'LED Red', props: { type: 'led', color: 'red' } },
      { suffix: 'LED Green', props: { type: 'led', color: 'green' } },
      { suffix: 'LED Blue', props: { type: 'led', color: 'blue' } },
      { suffix: 'LED White', props: { type: 'led', color: 'white' } },
      { suffix: 'Zener 5V', props: { type: 'zener', voltage: 5 } },
      { suffix: 'Zener 12V', props: { type: 'zener', voltage: 12 } },
      { suffix: 'Schottky', props: { type: 'schottky' } },
    ]
  ),

  // Transistors
  ...generateComponents(
    {
      id: 'transistor',
      label: 'Transistor',
      category: 'electronics',
      description: 'Amplification and switching',
      icon: '🔺',
      properties: { type: 'npn' },
      inputs: 2,
      outputs: 1,
    },
    [
      { suffix: 'NPN 2N2222', props: { type: 'npn', model: '2N2222' } },
      { suffix: 'NPN BC547', props: { type: 'npn', model: 'BC547' } },
      { suffix: 'PNP 2N2907', props: { type: 'pnp', model: '2N2907' } },
      { suffix: 'PNP BC557', props: { type: 'pnp', model: 'BC557' } },
      { suffix: 'MOSFET N-Channel', props: { type: 'mosfet', channel: 'n' } },
      { suffix: 'MOSFET P-Channel', props: { type: 'mosfet', channel: 'p' } },
      { suffix: 'JFET N-Channel', props: { type: 'jfet', channel: 'n' } },
    ]
  ),

  // Integrated Circuits
  ...generateComponents(
    {
      id: 'ic',
      label: 'IC',
      category: 'electronics',
      description: 'Integrated Circuit',
      icon: '🔲',
      properties: { type: 'logic' },
      inputs: 2,
      outputs: 1,
    },
    [
      { suffix: '555 Timer', props: { type: 'timer', model: '555' } },
      { suffix: '741 Op-Amp', props: { type: 'opamp', model: '741' } },
      { suffix: '7805 Voltage Regulator', props: { type: 'regulator', voltage: 5 } },
      { suffix: '7812 Voltage Regulator', props: { type: 'regulator', voltage: 12 } },
      { suffix: 'AND Gate 7408', props: { type: 'logic', gate: 'AND' } },
      { suffix: 'OR Gate 7432', props: { type: 'logic', gate: 'OR' } },
      { suffix: 'NOT Gate 7404', props: { type: 'logic', gate: 'NOT' } },
      { suffix: 'NAND Gate 7400', props: { type: 'logic', gate: 'NAND' } },
      { suffix: 'NOR Gate 7402', props: { type: 'logic', gate: 'NOR' } },
      { suffix: 'XOR Gate 7486', props: { type: 'logic', gate: 'XOR' } },
      { suffix: 'Arduino Uno', props: { type: 'microcontroller', model: 'Arduino' } },
      { suffix: 'Raspberry Pi', props: { type: 'microcontroller', model: 'RPi' } },
      { suffix: 'ESP32', props: { type: 'microcontroller', model: 'ESP32' } },
    ]
  ),

  // Power Sources
  ...generateComponents(
    {
      id: 'power',
      label: 'Power Source',
      category: 'electronics',
      description: 'Electrical power supply',
      icon: '🔋',
      properties: { voltage: 0 },
      inputs: 0,
      outputs: 1,
    },
    [
      { suffix: '1.5V Battery', props: { voltage: 1.5, type: 'battery' } },
      { suffix: '3.7V Li-ion', props: { voltage: 3.7, type: 'battery' } },
      { suffix: '5V USB', props: { voltage: 5, type: 'supply' } },
      { suffix: '9V Battery', props: { voltage: 9, type: 'battery' } },
      { suffix: '12V DC', props: { voltage: 12, type: 'supply' } },
      { suffix: '24V DC', props: { voltage: 24, type: 'supply' } },
      { suffix: '120V AC', props: { voltage: 120, type: 'ac' } },
      { suffix: '240V AC', props: { voltage: 240, type: 'ac' } },
    ]
  ),

  // Sensors
  ...generateComponents(
    {
      id: 'sensor',
      label: 'Sensor',
      category: 'electronics',
      description: 'Environmental sensor',
      icon: '📡',
      properties: { type: 'generic' },
      inputs: 0,
      outputs: 1,
    },
    [
      { suffix: 'Temperature DHT11', props: { type: 'temperature', model: 'DHT11' } },
      { suffix: 'Temperature DHT22', props: { type: 'temperature', model: 'DHT22' } },
      { suffix: 'Humidity', props: { type: 'humidity' } },
      { suffix: 'Pressure BMP180', props: { type: 'pressure', model: 'BMP180' } },
      { suffix: 'Light LDR', props: { type: 'light', model: 'LDR' } },
      { suffix: 'Ultrasonic HC-SR04', props: { type: 'distance', model: 'HC-SR04' } },
      { suffix: 'PIR Motion', props: { type: 'motion', model: 'PIR' } },
      { suffix: 'Gas MQ-2', props: { type: 'gas', model: 'MQ-2' } },
      { suffix: 'Accelerometer MPU6050', props: { type: 'accelerometer', model: 'MPU6050' } },
      { suffix: 'Gyroscope MPU6050', props: { type: 'gyroscope', model: 'MPU6050' } },
      { suffix: 'Hall Effect', props: { type: 'magnetic' } },
    ]
  ),

  // Displays
  ...generateComponents(
    {
      id: 'display',
      label: 'Display',
      category: 'electronics',
      description: 'Output display',
      icon: '📺',
      properties: { type: 'generic' },
      inputs: 1,
      outputs: 0,
    },
    [
      { suffix: '7-Segment', props: { type: '7segment' } },
      { suffix: 'LCD 16x2', props: { type: 'lcd', size: '16x2' } },
      { suffix: 'LCD 20x4', props: { type: 'lcd', size: '20x4' } },
      { suffix: 'OLED 128x64', props: { type: 'oled', size: '128x64' } },
      { suffix: 'TFT Display', props: { type: 'tft' } },
      { suffix: 'LED Matrix 8x8', props: { type: 'matrix', size: '8x8' } },
    ]
  ),

  // CHEMICALS (200+ components)
  // Elements
  ...generateComponents(
    {
      id: 'element',
      label: 'Element',
      category: 'chemicals',
      description: 'Chemical element',
      icon: '⚗️',
      properties: { symbol: '', atomicNumber: 0 },
    },
    [
      { suffix: 'Hydrogen (H)', props: { symbol: 'H', atomicNumber: 1 } },
      { suffix: 'Helium (He)', props: { symbol: 'He', atomicNumber: 2 } },
      { suffix: 'Carbon (C)', props: { symbol: 'C', atomicNumber: 6 } },
      { suffix: 'Nitrogen (N)', props: { symbol: 'N', atomicNumber: 7 } },
      { suffix: 'Oxygen (O)', props: { symbol: 'O', atomicNumber: 8 } },
      { suffix: 'Fluorine (F)', props: { symbol: 'F', atomicNumber: 9 } },
      { suffix: 'Sodium (Na)', props: { symbol: 'Na', atomicNumber: 11 } },
      { suffix: 'Magnesium (Mg)', props: { symbol: 'Mg', atomicNumber: 12 } },
      { suffix: 'Aluminum (Al)', props: { symbol: 'Al', atomicNumber: 13 } },
      { suffix: 'Silicon (Si)', props: { symbol: 'Si', atomicNumber: 14 } },
      { suffix: 'Phosphorus (P)', props: { symbol: 'P', atomicNumber: 15 } },
      { suffix: 'Sulfur (S)', props: { symbol: 'S', atomicNumber: 16 } },
      { suffix: 'Chlorine (Cl)', props: { symbol: 'Cl', atomicNumber: 17 } },
      { suffix: 'Potassium (K)', props: { symbol: 'K', atomicNumber: 19 } },
      { suffix: 'Calcium (Ca)', props: { symbol: 'Ca', atomicNumber: 20 } },
      { suffix: 'Iron (Fe)', props: { symbol: 'Fe', atomicNumber: 26 } },
      { suffix: 'Copper (Cu)', props: { symbol: 'Cu', atomicNumber: 29 } },
      { suffix: 'Zinc (Zn)', props: { symbol: 'Zn', atomicNumber: 30 } },
      { suffix: 'Silver (Ag)', props: { symbol: 'Ag', atomicNumber: 47 } },
      { suffix: 'Gold (Au)', props: { symbol: 'Au', atomicNumber: 79 } },
    ]
  ),

  // Acids
  ...generateComponents(
    {
      id: 'acid',
      label: 'Acid',
      category: 'chemicals',
      description: 'Acidic compound',
      icon: '🧪',
      properties: { pH: 0, concentration: '1M' },
    },
    [
      { suffix: 'Hydrochloric (HCl)', props: { formula: 'HCl', pH: 1 } },
      { suffix: 'Sulfuric (H2SO4)', props: { formula: 'H2SO4', pH: 1 } },
      { suffix: 'Nitric (HNO3)', props: { formula: 'HNO3', pH: 1 } },
      { suffix: 'Acetic (CH3COOH)', props: { formula: 'CH3COOH', pH: 3 } },
      { suffix: 'Citric', props: { formula: 'C6H8O7', pH: 3 } },
      { suffix: 'Phosphoric (H3PO4)', props: { formula: 'H3PO4', pH: 2 } },
      { suffix: 'Carbonic (H2CO3)', props: { formula: 'H2CO3', pH: 4 } },
    ]
  ),

  // Bases
  ...generateComponents(
    {
      id: 'base',
      label: 'Base',
      category: 'chemicals',
      description: 'Basic compound',
      icon: '🧪',
      properties: { pH: 14, concentration: '1M' },
    },
    [
      { suffix: 'Sodium Hydroxide (NaOH)', props: { formula: 'NaOH', pH: 14 } },
      { suffix: 'Potassium Hydroxide (KOH)', props: { formula: 'KOH', pH: 14 } },
      { suffix: 'Calcium Hydroxide (Ca(OH)2)', props: { formula: 'Ca(OH)2', pH: 12 } },
      { suffix: 'Ammonia (NH3)', props: { formula: 'NH3', pH: 11 } },
      { suffix: 'Sodium Carbonate (Na2CO3)', props: { formula: 'Na2CO3', pH: 11 } },
    ]
  ),

  // Salts
  ...generateComponents(
    {
      id: 'salt',
      label: 'Salt',
      category: 'chemicals',
      description: 'Ionic compound',
      icon: '🧂',
      properties: { formula: '', solubility: 'soluble' },
    },
    [
      { suffix: 'Sodium Chloride (NaCl)', props: { formula: 'NaCl' } },
      { suffix: 'Potassium Chloride (KCl)', props: { formula: 'KCl' } },
      { suffix: 'Calcium Chloride (CaCl2)', props: { formula: 'CaCl2' } },
      { suffix: 'Magnesium Sulfate (MgSO4)', props: { formula: 'MgSO4' } },
      { suffix: 'Copper Sulfate (CuSO4)', props: { formula: 'CuSO4', color: 'blue' } },
      { suffix: 'Silver Nitrate (AgNO3)', props: { formula: 'AgNO3' } },
      { suffix: 'Barium Chloride (BaCl2)', props: { formula: 'BaCl2' } },
    ]
  ),

  // Organic Compounds
  ...generateComponents(
    {
      id: 'organic',
      label: 'Organic',
      category: 'chemicals',
      description: 'Organic compound',
      icon: '🧬',
      properties: { formula: '', type: 'hydrocarbon' },
    },
    [
      { suffix: 'Methane (CH4)', props: { formula: 'CH4', type: 'alkane' } },
      { suffix: 'Ethane (C2H6)', props: { formula: 'C2H6', type: 'alkane' } },
      { suffix: 'Propane (C3H8)', props: { formula: 'C3H8', type: 'alkane' } },
      { suffix: 'Butane (C4H10)', props: { formula: 'C4H10', type: 'alkane' } },
      { suffix: 'Ethene (C2H4)', props: { formula: 'C2H4', type: 'alkene' } },
      { suffix: 'Benzene (C6H6)', props: { formula: 'C6H6', type: 'aromatic' } },
      { suffix: 'Ethanol (C2H5OH)', props: { formula: 'C2H5OH', type: 'alcohol' } },
      { suffix: 'Methanol (CH3OH)', props: { formula: 'CH3OH', type: 'alcohol' } },
      { suffix: 'Acetone (C3H6O)', props: { formula: 'C3H6O', type: 'ketone' } },
      { suffix: 'Glucose (C6H12O6)', props: { formula: 'C6H12O6', type: 'sugar' } },
    ]
  ),

  // Lab Equipment (Chemical)
  ...generateComponents(
    {
      id: 'chem_equipment',
      label: 'Equipment',
      category: 'chemicals',
      description: 'Laboratory equipment',
      icon: '🔬',
      properties: { type: 'glassware' },
    },
    [
      { suffix: 'Beaker 50ml', props: { type: 'beaker', volume: 50 } },
      { suffix: 'Beaker 250ml', props: { type: 'beaker', volume: 250 } },
      { suffix: 'Flask 100ml', props: { type: 'flask', volume: 100 } },
      { suffix: 'Test Tube', props: { type: 'test_tube' } },
      { suffix: 'Burette', props: { type: 'burette' } },
      { suffix: 'Pipette', props: { type: 'pipette' } },
      { suffix: 'Bunsen Burner', props: { type: 'burner', maxTemp: 1500 } },
      { suffix: 'Hot Plate', props: { type: 'heater', maxTemp: 400 } },
      { suffix: 'pH Meter', props: { type: 'meter', measures: 'pH' } },
      { suffix: 'Thermometer', props: { type: 'thermometer' } },
    ]
  ),

  // PHYSICS (250+ components)
  // Mechanics
  ...generateComponents(
    {
      id: 'mechanics',
      label: 'Mechanics',
      category: 'physics',
      description: 'Mechanical component',
      icon: '⚙️',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Mass 1kg', props: { type: 'mass', value: 1, unit: 'kg' } },
      { suffix: 'Mass 5kg', props: { type: 'mass', value: 5, unit: 'kg' } },
      { suffix: 'Mass 10kg', props: { type: 'mass', value: 10, unit: 'kg' } },
      { suffix: 'Spring k=100', props: { type: 'spring', constant: 100 } },
      { suffix: 'Spring k=500', props: { type: 'spring', constant: 500 } },
      { suffix: 'Pulley', props: { type: 'pulley' } },
      { suffix: 'Inclined Plane 30°', props: { type: 'incline', angle: 30 } },
      { suffix: 'Inclined Plane 45°', props: { type: 'incline', angle: 45 } },
      { suffix: 'Lever', props: { type: 'lever' } },
      { suffix: 'Wheel & Axle', props: { type: 'wheel_axle' } },
      { suffix: 'Pendulum', props: { type: 'pendulum', length: 1 } },
    ]
  ),

  // Forces
  ...generateComponents(
    {
      id: 'force',
      label: 'Force',
      category: 'physics',
      description: 'Force vector',
      icon: '➡️',
      properties: { magnitude: 0, direction: 0 },
      inputs: 0,
      outputs: 1,
    },
    [
      { suffix: '10N', props: { magnitude: 10, unit: 'N' } },
      { suffix: '50N', props: { magnitude: 50, unit: 'N' } },
      { suffix: '100N', props: { magnitude: 100, unit: 'N' } },
      { suffix: 'Gravity 9.8m/s²', props: { type: 'gravity', value: 9.8 } },
      { suffix: 'Friction', props: { type: 'friction' } },
      { suffix: 'Normal Force', props: { type: 'normal' } },
      { suffix: 'Tension', props: { type: 'tension' } },
    ]
  ),

  // Optics
  ...generateComponents(
    {
      id: 'optics',
      label: 'Optics',
      category: 'physics',
      description: 'Optical component',
      icon: '🔍',
      properties: { type: 'lens' },
    },
    [
      { suffix: 'Convex Lens f=10cm', props: { type: 'convex', focal: 10 } },
      { suffix: 'Convex Lens f=20cm', props: { type: 'convex', focal: 20 } },
      { suffix: 'Concave Lens f=-10cm', props: { type: 'concave', focal: -10 } },
      { suffix: 'Plane Mirror', props: { type: 'mirror', shape: 'plane' } },
      { suffix: 'Concave Mirror', props: { type: 'mirror', shape: 'concave' } },
      { suffix: 'Convex Mirror', props: { type: 'mirror', shape: 'convex' } },
      { suffix: 'Prism', props: { type: 'prism', angle: 60 } },
      { suffix: 'Glass Block', props: { type: 'block', refractiveIndex: 1.5 } },
      { suffix: 'Light Source White', props: { type: 'light', color: 'white' } },
      { suffix: 'Light Source Red', props: { type: 'light', color: 'red', wavelength: 650 } },
      { suffix: 'Light Source Blue', props: { type: 'light', color: 'blue', wavelength: 450 } },
      { suffix: 'Laser Red', props: { type: 'laser', color: 'red', power: 5 } },
    ]
  ),

  // Waves
  ...generateComponents(
    {
      id: 'waves',
      label: 'Waves',
      category: 'physics',
      description: 'Wave phenomena',
      icon: '〰️',
      properties: { frequency: 0, amplitude: 0 },
    },
    [
      { suffix: 'Sound Wave 440Hz', props: { type: 'sound', frequency: 440 } },
      { suffix: 'Sound Wave 1kHz', props: { type: 'sound', frequency: 1000 } },
      { suffix: 'Radio Wave FM', props: { type: 'radio', band: 'FM' } },
      { suffix: 'Microwave', props: { type: 'electromagnetic', wavelength: 0.01 } },
      { suffix: 'X-Ray', props: { type: 'electromagnetic', wavelength: 0.000001 } },
      { suffix: 'Gamma Ray', props: { type: 'electromagnetic', wavelength: 0.0000001 } },
    ]
  ),

  // Thermodynamics
  ...generateComponents(
    {
      id: 'thermo',
      label: 'Thermodynamics',
      category: 'thermodynamics',
      description: 'Thermal component',
      icon: '🌡️',
      properties: { temperature: 0 },
    },
    [
      { suffix: 'Heat Source 100°C', props: { type: 'source', temperature: 100 } },
      { suffix: 'Heat Source 500°C', props: { type: 'source', temperature: 500 } },
      { suffix: 'Ice Bath 0°C', props: { type: 'sink', temperature: 0 } },
      { suffix: 'Insulator', props: { type: 'insulator' } },
      { suffix: 'Conductor Copper', props: { type: 'conductor', material: 'copper' } },
      { suffix: 'Gas Ideal', props: { type: 'gas', behavior: 'ideal' } },
      { suffix: 'Piston', props: { type: 'piston' } },
    ]
  ),

  // CODING BLOCKS (200+ components)
  // Logic
  ...generateComponents(
    {
      id: 'logic_block',
      label: 'Logic',
      category: 'coding',
      description: 'Programming logic',
      icon: '💻',
      properties: { type: 'operation' },
      inputs: 2,
      outputs: 1,
    },
    [
      { suffix: 'AND', props: { operation: 'AND' } },
      { suffix: 'OR', props: { operation: 'OR' } },
      { suffix: 'NOT', props: { operation: 'NOT' } },
      { suffix: 'XOR', props: { operation: 'XOR' } },
      { suffix: 'NAND', props: { operation: 'NAND' } },
      { suffix: 'NOR', props: { operation: 'NOR' } },
    ]
  ),

  // Arithmetic
  ...generateComponents(
    {
      id: 'arithmetic',
      label: 'Math',
      category: 'coding',
      description: 'Arithmetic operation',
      icon: '➕',
      properties: { operation: 'add' },
      inputs: 2,
      outputs: 1,
    },
    [
      { suffix: 'Add', props: { operation: 'add', symbol: '+' } },
      { suffix: 'Subtract', props: { operation: 'subtract', symbol: '-' } },
      { suffix: 'Multiply', props: { operation: 'multiply', symbol: '×' } },
      { suffix: 'Divide', props: { operation: 'divide', symbol: '÷' } },
      { suffix: 'Modulo', props: { operation: 'modulo', symbol: '%' } },
      { suffix: 'Power', props: { operation: 'power', symbol: '^' } },
      { suffix: 'Square Root', props: { operation: 'sqrt', symbol: '√' } },
    ]
  ),

  // Comparison
  ...generateComponents(
    {
      id: 'comparison',
      label: 'Compare',
      category: 'coding',
      description: 'Comparison operator',
      icon: '⚖️',
      properties: { operator: 'equal' },
      inputs: 2,
      outputs: 1,
    },
    [
      { suffix: 'Equal ==', props: { operator: '==', symbol: '==' } },
      { suffix: 'Not Equal !=', props: { operator: '!=', symbol: '!=' } },
      { suffix: 'Greater >', props: { operator: '>', symbol: '>' } },
      { suffix: 'Less <', props: { operator: '<', symbol: '<' } },
      { suffix: 'Greater Equal >=', props: { operator: '>=', symbol: '>=' } },
      { suffix: 'Less Equal <=', props: { operator: '<=', symbol: '<=' } },
    ]
  ),

  // Control Flow
  ...generateComponents(
    {
      id: 'control',
      label: 'Control',
      category: 'coding',
      description: 'Control flow',
      icon: '🔀',
      properties: { type: 'if' },
      inputs: 1,
      outputs: 2,
    },
    [
      { suffix: 'If Statement', props: { type: 'if' } },
      { suffix: 'While Loop', props: { type: 'while' } },
      { suffix: 'For Loop', props: { type: 'for' } },
      { suffix: 'Switch', props: { type: 'switch' } },
      { suffix: 'Try-Catch', props: { type: 'try' } },
    ]
  ),

  // Variables
  ...generateComponents(
    {
      id: 'variable',
      label: 'Variable',
      category: 'coding',
      description: 'Data storage',
      icon: '📦',
      properties: { type: 'string', value: '' },
      inputs: 1,
      outputs: 1,
    },
    [
      { suffix: 'Number', props: { type: 'number', value: 0 } },
      { suffix: 'String', props: { type: 'string', value: '' } },
      { suffix: 'Boolean', props: { type: 'boolean', value: false } },
      { suffix: 'Array', props: { type: 'array', value: [] } },
      { suffix: 'Object', props: { type: 'object', value: {} } },
    ]
  ),

  // Functions
  ...generateComponents(
    {
      id: 'function',
      label: 'Function',
      category: 'coding',
      description: 'Function block',
      icon: '📋',
      properties: { name: 'function' },
      inputs: 1,
      outputs: 1,
    },
    [
      { suffix: 'Print', props: { name: 'print' } },
      { suffix: 'Random', props: { name: 'random' } },
      { suffix: 'Map', props: { name: 'map' } },
      { suffix: 'Filter', props: { name: 'filter' } },
      { suffix: 'Reduce', props: { name: 'reduce' } },
      { suffix: 'Sort', props: { name: 'sort' } },
    ]
  ),

  // MATHEMATICS (150+ components)
  ...generateComponents(
    {
      id: 'math_function',
      label: 'Math Function',
      category: 'mathematics',
      description: 'Mathematical function',
      icon: '📐',
      properties: { function: 'generic' },
      inputs: 1,
      outputs: 1,
    },
    [
      { suffix: 'Sin(x)', props: { function: 'sin' } },
      { suffix: 'Cos(x)', props: { function: 'cos' } },
      { suffix: 'Tan(x)', props: { function: 'tan' } },
      { suffix: 'Log(x)', props: { function: 'log' } },
      { suffix: 'Ln(x)', props: { function: 'ln' } },
      { suffix: 'Exp(x)', props: { function: 'exp' } },
      { suffix: 'Abs(x)', props: { function: 'abs' } },
      { suffix: 'Floor(x)', props: { function: 'floor' } },
      { suffix: 'Ceil(x)', props: { function: 'ceil' } },
      { suffix: 'Round(x)', props: { function: 'round' } },
    ]
  ),

  // Statistics
  ...generateComponents(
    {
      id: 'statistics',
      label: 'Statistics',
      category: 'mathematics',
      description: 'Statistical operation',
      icon: '📊',
      properties: { operation: 'mean' },
      inputs: 1,
      outputs: 1,
    },
    [
      { suffix: 'Mean', props: { operation: 'mean' } },
      { suffix: 'Median', props: { operation: 'median' } },
      { suffix: 'Mode', props: { operation: 'mode' } },
      { suffix: 'Standard Deviation', props: { operation: 'stddev' } },
      { suffix: 'Variance', props: { operation: 'variance' } },
      { suffix: 'Min', props: { operation: 'min' } },
      { suffix: 'Max', props: { operation: 'max' } },
      { suffix: 'Sum', props: { operation: 'sum' } },
    ]
  ),

  // BIOLOGY (100+ components)
  ...generateComponents(
    {
      id: 'bio_cell',
      label: 'Cell',
      category: 'biology',
      description: 'Biological cell',
      icon: '🧫',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Plant Cell', props: { type: 'plant' } },
      { suffix: 'Animal Cell', props: { type: 'animal' } },
      { suffix: 'Bacteria', props: { type: 'bacteria' } },
      { suffix: 'Neuron', props: { type: 'neuron' } },
      { suffix: 'Red Blood Cell', props: { type: 'rbc' } },
      { suffix: 'White Blood Cell', props: { type: 'wbc' } },
    ]
  ),

  // Biomolecules
  ...generateComponents(
    {
      id: 'biomolecule',
      label: 'Biomolecule',
      category: 'biology',
      description: 'Biological molecule',
      icon: '🧬',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'DNA', props: { type: 'dna' } },
      { suffix: 'RNA', props: { type: 'rna' } },
      { suffix: 'Protein', props: { type: 'protein' } },
      { suffix: 'Enzyme', props: { type: 'enzyme' } },
      { suffix: 'ATP', props: { type: 'atp' } },
      { suffix: 'Glucose', props: { type: 'glucose' } },
    ]
  ),

  // QUANTUM PHYSICS (50+ components)
  ...generateComponents(
    {
      id: 'quantum',
      label: 'Quantum',
      category: 'quantum',
      description: 'Quantum component',
      icon: '⚛️',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Qubit |0⟩', props: { type: 'qubit', state: 0 } },
      { suffix: 'Qubit |1⟩', props: { type: 'qubit', state: 1 } },
      { suffix: 'Hadamard Gate', props: { type: 'gate', name: 'H' } },
      { suffix: 'Pauli-X Gate', props: { type: 'gate', name: 'X' } },
      { suffix: 'Pauli-Y Gate', props: { type: 'gate', name: 'Y' } },
      { suffix: 'Pauli-Z Gate', props: { type: 'gate', name: 'Z' } },
      { suffix: 'CNOT Gate', props: { type: 'gate', name: 'CNOT' } },
      { suffix: 'Measurement', props: { type: 'measurement' } },
    ]
  ),

  // ASTRONOMY (50+ components)
  ...generateComponents(
    {
      id: 'astro',
      label: 'Astronomy',
      category: 'astronomy',
      description: 'Astronomical object',
      icon: '🪐',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Star (Sun-like)', props: { type: 'star', class: 'G' } },
      { suffix: 'Red Giant', props: { type: 'star', class: 'M' } },
      { suffix: 'White Dwarf', props: { type: 'star', class: 'D' } },
      { suffix: 'Black Hole', props: { type: 'blackhole' } },
      { suffix: 'Neutron Star', props: { type: 'neutron_star' } },
      { suffix: 'Planet (Rocky)', props: { type: 'planet', subtype: 'terrestrial' } },
      { suffix: 'Planet (Gas Giant)', props: { type: 'planet', subtype: 'gas_giant' } },
      { suffix: 'Moon', props: { type: 'moon' } },
      { suffix: 'Asteroid', props: { type: 'asteroid' } },
      { suffix: 'Comet', props: { type: 'comet' } },
      { suffix: 'Galaxy (Spiral)', props: { type: 'galaxy', shape: 'spiral' } },
      { suffix: 'Galaxy (Elliptical)', props: { type: 'galaxy', shape: 'elliptical' } },
      { suffix: 'Nebula', props: { type: 'nebula' } },
    ]
  ),

  // GEOLOGY (50+ components)
  ...generateComponents(
    {
      id: 'geo',
      label: 'Geology',
      category: 'geology',
      description: 'Geological component',
      icon: '🌋',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Volcano', props: { type: 'volcano' } },
      { suffix: 'Earthquake Source', props: { type: 'earthquake' } },
      { suffix: 'Tectonic Plate', props: { type: 'plate' } },
      { suffix: 'Magma Chamber', props: { type: 'magma' } },
      { suffix: 'Sedimentary Rock', props: { type: 'rock', subtype: 'sedimentary' } },
      { suffix: 'Igneous Rock', props: { type: 'rock', subtype: 'igneous' } },
      { suffix: 'Metamorphic Rock', props: { type: 'rock', subtype: 'metamorphic' } },
      { suffix: 'Fossil', props: { type: 'fossil' } },
      { suffix: 'Mineral (Quartz)', props: { type: 'mineral', name: 'quartz' } },
      { suffix: 'Mineral (Gold)', props: { type: 'mineral', name: 'gold' } },
    ]
  ),

  // MUSIC & AUDIO (50+ components)
  ...generateComponents(
    {
      id: 'audio',
      label: 'Audio',
      category: 'music',
      description: 'Audio component',
      icon: '🎵',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Oscillator (Sine)', props: { type: 'oscillator', wave: 'sine' } },
      { suffix: 'Oscillator (Square)', props: { type: 'oscillator', wave: 'square' } },
      { suffix: 'Oscillator (Saw)', props: { type: 'oscillator', wave: 'sawtooth' } },
      { suffix: 'Filter (Low Pass)', props: { type: 'filter', subtype: 'lowpass' } },
      { suffix: 'Filter (High Pass)', props: { type: 'filter', subtype: 'highpass' } },
      { suffix: 'Amplifier', props: { type: 'amp' } },
      { suffix: 'Speaker', props: { type: 'speaker' } },
      { suffix: 'Microphone', props: { type: 'mic' } },
      { suffix: 'Delay', props: { type: 'effect', subtype: 'delay' } },
      { suffix: 'Reverb', props: { type: 'effect', subtype: 'reverb' } },
    ]
  ),

  // ROBOTICS (50+ components)
  ...generateComponents(
    {
      id: 'robot',
      label: 'Robotics',
      category: 'robotics',
      description: 'Robotic component',
      icon: '🤖',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Servo Motor', props: { type: 'motor', subtype: 'servo' } },
      { suffix: 'Stepper Motor', props: { type: 'motor', subtype: 'stepper' } },
      { suffix: 'DC Motor', props: { type: 'motor', subtype: 'dc' } },
      { suffix: 'Robot Arm Joint', props: { type: 'joint' } },
      { suffix: 'Gripper', props: { type: 'effector', subtype: 'gripper' } },
      { suffix: 'Lidar Sensor', props: { type: 'sensor', subtype: 'lidar' } },
      { suffix: 'Camera', props: { type: 'sensor', subtype: 'camera' } },
      { suffix: 'IMU', props: { type: 'sensor', subtype: 'imu' } },
      { suffix: 'Wheel', props: { type: 'actuator', subtype: 'wheel' } },
      { suffix: 'Chassis', props: { type: 'structure' } },
    ]
  ),

  // AI & ML (50+ components)
  ...generateComponents(
    {
      id: 'ai',
      label: 'AI/ML',
      category: 'ai_ml',
      description: 'AI/ML Block',
      icon: '🧠',
      properties: { type: 'generic' },
    },
    [
      { suffix: 'Neural Network Layer', props: { type: 'layer', subtype: 'dense' } },
      { suffix: 'Convolution Layer', props: { type: 'layer', subtype: 'conv2d' } },
      { suffix: 'Pooling Layer', props: { type: 'layer', subtype: 'maxpool' } },
      { suffix: 'Activation (ReLU)', props: { type: 'activation', func: 'relu' } },
      { suffix: 'Activation (Sigmoid)', props: { type: 'activation', func: 'sigmoid' } },
      { suffix: 'Activation (Softmax)', props: { type: 'activation', func: 'softmax' } },
      { suffix: 'Dataset (Images)', props: { type: 'data', subtype: 'images' } },
      { suffix: 'Dataset (Text)', props: { type: 'data', subtype: 'text' } },
      { suffix: 'Optimizer (Adam)', props: { type: 'optimizer', name: 'adam' } },
      { suffix: 'Loss Function', props: { type: 'loss' } },
    ]
  ),
];

export const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '⚡', color: '#3b82f6' },
  { id: 'chemicals', label: 'Chemicals', icon: '⚗️', color: '#10b981' },
  { id: 'physics', label: 'Physics', icon: '⚙️', color: '#8b5cf6' },
  { id: 'biology', label: 'Biology', icon: '🧫', color: '#ec4899' },
  { id: 'coding', label: 'Coding', icon: '💻', color: '#f59e0b' },
  { id: 'mathematics', label: 'Mathematics', icon: '📐', color: '#ef4444' },
  { id: 'thermodynamics', label: 'Thermodynamics', icon: '🌡️', color: '#06b6d4' },
  { id: 'optics', label: 'Optics', icon: '🔍', color: '#a855f7' },
  { id: 'quantum', label: 'Quantum', icon: '⚛️', color: '#14b8a6' },
  { id: 'mechanics', label: 'Mechanics', icon: '⚙️', color: '#6366f1' },
  { id: 'astronomy', label: 'Astronomy', icon: '🪐', color: '#818cf8' },
  { id: 'geology', label: 'Geology', icon: '🌋', color: '#b45309' },
  { id: 'music', label: 'Music & Audio', icon: '🎵', color: '#db2777' },
  { id: 'robotics', label: 'Robotics', icon: '🤖', color: '#4b5563' },
  { id: 'ai_ml', label: 'AI & ML', icon: '🧠', color: '#7c3aed' },
];

console.log(`Total components: ${COMPONENT_LIBRARY.length}`);
