# AI Experiment Lab 🧪⚡

A powerful visual experiment builder powered by AI. Create complex scientific experiments using drag-and-drop components, connect them together, and let AI analyze and predict the outcomes!

## Features

### Core Functionality

🎨 **Visual Canvas**: Drag-and-drop interface for building experiments (like Microsoft Paint meets n8n)
- Infinite canvas with pan and zoom
- Grid background for precision
- Minimap for navigation
- Multi-select and delete (press Delete key)

📚 **1000+ Components**: Extensive library across multiple categories:
- ⚡ **Electronics** (300+ components): Resistors, capacitors, transistors, ICs, sensors, displays
- ⚗️ **Chemicals** (200+ components): Elements, acids, bases, organic compounds, lab equipment
- ⚙️ **Physics** (250+ components): Mechanics, forces, optics, waves
- 🌡️ **Thermodynamics**: Heat sources, insulators, conductors, gases
- 💻 **Coding** (200+ components): Logic blocks, arithmetic, control flow, variables
- 📐 **Mathematics** (150+ components): Functions, statistics, trigonometry
- 🧫 **Biology** (100+ components): Cells, biomolecules, DNA
- ⚛️ **Quantum** (50+ components): Qubits, quantum gates

### Interactive Features

🔗 **Node Connections**: Connect components with animated flow lines
- Visual connections from outputs (green) to inputs (blue)
- Click connections to add labels/conditions
- Animated flow visualization

✏️ **Editable Components**:
- Double-click any component to customize its label
- Edit component text inline
- Customize experiment descriptions

🎬 **Example Experiments**: Pre-built experiments to get started quickly
- Simple LED Circuit (Electronics)
- Acid-Base Neutralization (Chemistry)
- Simple Pendulum (Physics)
- Conditional Logic Flow (Coding)

📥 **Import/Export**:
- Export experiments as JSON
- Import previously saved experiments
- Share experiments with others

### AI-Powered Analysis

🤖 **Google Gemini Integration**:
- Analyze your experiment setup
- Predict outcomes and results
- Provide step-by-step explanations
- Calculate numerical results
- Generate detailed reports

### User Experience

🎯 **Welcome Guide**: First-time users see an interactive tutorial
💾 **Local Storage**: API key saved securely in browser
🎨 **Modern UI**: Clean, intuitive interface with helpful tooltips
⌨️ **Keyboard Shortcuts**: Delete key to remove components

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Navigate to the aiexp folder:
```bash
cd aiexp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. In the app, click the "API Key" button and paste your key

## How to Use

### First Time Setup

1. On first launch, you'll see a **Welcome Modal** with instructions
2. Click **"API Key"** button and enter your Google Gemini API key
3. Your API key is saved securely in browser local storage
4. Try loading an **Example Experiment** to see how it works!

### Building an Experiment

1. **Browse Components**: Use the left sidebar to browse 1000+ components
   - 🔍 Search for specific components
   - 🏷️ Filter by category (Electronics, Chemicals, Physics, etc.)
   - 📊 See component count for each category

2. **Add Components**: Drag components from the library onto the canvas
   - Components appear with icons and labels
   - Each component shows its category badge

3. **Connect Components**: Click and drag from output (green dot) to input (blue dot)
   - Connections are animated for visual feedback
   - Click any connection to add a label/condition

4. **Edit Labels**: Double-click any component to edit its text
   - Type new text and press Enter or click outside
   - Customize component descriptions

5. **Load Examples**: Click **"Examples"** button to load pre-built experiments
   - Choose from 4 example experiments
   - Learn from working examples

6. **Run Analysis**: Click **"Run Experiment"** button to analyze with AI
   - Results appear in the right panel
   - Get detailed explanations and predictions

7. **Export/Import**:
   - Click **"Export"** to download experiment as JSON
   - Click **"Import"** to load a saved experiment
   - Share experiments with others

8. **Clear Canvas**: Click **"Clear"** to start fresh
   - Confirmation dialog prevents accidental deletion

### Example Experiments

#### Simple Circuit
1. Add a "Power Source 5V USB"
2. Add a "Resistor 220Ω"
3. Add a "LED Red"
4. Connect them in series
5. Run analysis to see the predicted behavior

#### Chemical Reaction
1. Add "Hydrochloric (HCl)" acid
2. Add "Sodium Hydroxide (NaOH)" base
3. Add a "Beaker 250ml"
4. Connect the components
5. Run analysis to predict the neutralization reaction

#### Physics Experiment
1. Add "Mass 1kg"
2. Add "Spring k=100"
3. Add "Force 10N"
4. Connect them to simulate spring mechanics
5. Run analysis to calculate displacement and oscillation

#### Coding Logic
1. Add "Variable Number"
2. Add "Compare Greater >"
3. Add "If Statement"
4. Add "Math Add"
5. Connect to create a conditional flow
6. Run analysis to trace execution

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow** - Node-based editor
- **Google Gemini AI** - AI analysis engine
- **Zustand** - State management
- **Lucide React** - Icons

## Project Structure

```
aiexp/
├── src/
│   ├── components/
│   │   ├── CustomNode.tsx      # Individual node component
│   │   └── ComponentLibrary.tsx # Sidebar component library
│   ├── data/
│   │   └── componentLibrary.ts  # 1000+ component definitions
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── utils/
│   │   ├── geminiService.ts    # Gemini API integration
│   │   └── jsonGenerator.ts    # JSON export utility
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features in Detail

### Component System
- Each component has properties (resistance, capacitance, voltage, etc.)
- Components have inputs and outputs for connections
- Visual icons and category badges
- Searchable and filterable

### Canvas System
- Infinite canvas with pan and zoom
- Grid background
- Minimap for navigation
- Multi-select and delete
- Undo/redo support (Ctrl+Z / Ctrl+Y)

### AI Analysis
- Converts visual experiment to structured JSON
- Sends to Gemini for analysis
- Receives detailed explanations
- Shows step-by-step process
- Calculates numerical results

### JSON Export
- Clean, structured format
- Includes all node data
- Connection information
- Metadata (timestamp, description)
- Can be imported back (future feature)

## Keyboard Shortcuts

- **Delete** - Delete selected nodes/edges
- **Ctrl + Z** - Undo
- **Ctrl + Y** - Redo
- **Mouse Wheel** - Zoom in/out
- **Middle Mouse Button** - Pan canvas

## Tips & Tricks

1. **Double-click** nodes to rename them with custom labels
2. Use **categories** to quickly find component types
3. **Search** for specific components (e.g., "LED", "resistor")
4. Connect multiple components to create complex flows
5. The AI works best with logical, realistic experiment setups
6. Export JSON to save your work and share with others

## Troubleshooting

### API Key Issues
- Make sure you've entered a valid Gemini API key
- Check that your API key has the necessary permissions
- Verify your Google Cloud project has the Generative AI API enabled

### Components Not Appearing
- Clear your search filter
- Select "All" categories
- Refresh the page

### Canvas Performance
- If the canvas feels slow with many nodes, try:
  - Deleting unused nodes
  - Working in smaller sections
  - Refreshing the browser

## Future Enhancements

- [ ] Save/Load experiments to local storage
- [ ] Import JSON files
- [ ] Real-time collaboration
- [ ] Animation of experiment flow
- [ ] More component properties editing
- [ ] Custom component creation
- [ ] Export to different formats (PDF, PNG)
- [ ] Code generation from experiments
- [ ] 3D visualization mode

## Contributing

This is an open experiment! Feel free to:
- Add more components to the library
- Improve AI prompts for better analysis
- Add new features
- Report bugs
- Share your experiments

## License

MIT License - Feel free to use this for learning and experimentation!

## Credits

Built with ❤️ using:
- React Flow for the amazing node editor
- Google Gemini for AI-powered analysis
- The open-source community

---

**Happy Experimenting! 🚀**

Try building your first experiment and see what the AI discovers!
