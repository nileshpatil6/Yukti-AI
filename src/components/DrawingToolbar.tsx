import { DrawingTool, DrawingSettings } from '../types/drawing';
import {
  Pencil,
  PaintBucket,
  Type,
  Eraser,
  Pipette,
  Paintbrush,
  Minus,
  Square,
  Circle,
  Triangle,
  Pentagon,
  Edit3,
} from 'lucide-react';

interface DrawingToolbarProps {
  settings: DrawingSettings;
  onSettingsChange: (settings: DrawingSettings) => void;
  isDrawingMode: boolean;
  onDrawingModeToggle: () => void;
}

const PRIMARY_COLORS = [
  ['#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8', '#3F48CC', '#A349A4'],
  ['#FFFFFF', '#C3C3C3', '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7'],
];

export function DrawingToolbar({ settings, onSettingsChange, isDrawingMode, onDrawingModeToggle }: DrawingToolbarProps) {
  if (!isDrawingMode) return null;

  const tools = [
    { name: 'pencil' as DrawingTool, icon: Pencil, label: 'Pencil (Auto-corrects shapes!)' },
    { name: 'select' as DrawingTool, icon: Pipette, label: 'Select & Connect shapes' },
    { name: 'fill' as DrawingTool, icon: PaintBucket, label: 'Fill with color' },
    { name: 'text' as DrawingTool, icon: Type, label: 'Text' },
    { name: 'eraser' as DrawingTool, icon: Eraser, label: 'Eraser' },
  ];

  const brushes = [
    { name: 'brush' as DrawingTool, icon: Paintbrush, label: 'Brush' },
    { name: 'spray' as DrawingTool, icon: Edit3, label: 'Spray paint' },
  ];

  const shapes = [
    { name: 'line' as DrawingTool, icon: Minus, label: 'Line' },
    { name: 'rectangle' as DrawingTool, icon: Square, label: 'Rectangle' },
    { name: 'circle' as DrawingTool, icon: Circle, label: 'Oval' },
    { name: 'triangle' as DrawingTool, icon: Triangle, label: 'Triangle' },
    { name: 'rounded-rect' as DrawingTool, icon: Square, label: 'Rounded rectangle' },
    { name: 'polygon' as DrawingTool, icon: Pentagon, label: 'Polygon' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #d5d5d5',
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      }}
    >
      {/* Top Menu Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: '#e5e5e5',
          borderBottom: '1px solid #d0d0d0',
          fontSize: '11px',
        }}
      >
        <button
          onClick={onDrawingModeToggle}
          style={{
            padding: '4px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #adadad',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '11px',
            marginRight: '8px',
          }}
        >
          File
        </button>
        <span style={{ fontSize: '11px', color: '#666' }}>Home</span>
        <button
          onClick={onDrawingModeToggle}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          Exit Drawing Mode
        </button>
      </div>

      {/* Main Toolbar */}
      <div
        style={{
          display: 'flex',
          padding: '8px',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        {/* Tools Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px', paddingLeft: '4px' }}>
            Tools
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
              padding: '4px',
              backgroundColor: '#fff',
              border: '1px solid #d0d0d0',
              borderRadius: '2px',
            }}
          >
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.name}
                  onClick={() => onSettingsChange({ ...settings, tool: tool.name })}
                  title={tool.label}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '6px',
                    backgroundColor: settings.tool === tool.name ? '#cce8ff' : 'transparent',
                    border: settings.tool === tool.name ? '1px solid #0078d7' : '1px solid transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (settings.tool !== tool.name) {
                      e.currentTarget.style.backgroundColor = '#e5f3ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (settings.tool !== tool.name) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={16} color="#000" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Brushes Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px', paddingLeft: '4px' }}>
            Brushes
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '4px',
              backgroundColor: '#fff',
              border: '1px solid #d0d0d0',
              borderRadius: '2px',
            }}
          >
            {brushes.map((brush) => {
              const Icon = brush.icon;
              return (
                <button
                  key={brush.name}
                  onClick={() => onSettingsChange({ ...settings, tool: brush.name })}
                  title={brush.label}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '6px',
                    backgroundColor: settings.tool === brush.name ? '#cce8ff' : 'transparent',
                    border: settings.tool === brush.name ? '1px solid #0078d7' : '1px solid transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (settings.tool !== brush.name) {
                      e.currentTarget.style.backgroundColor = '#e5f3ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (settings.tool !== brush.name) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={16} color="#000" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Shapes Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px', paddingLeft: '4px' }}>
            Shapes
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
              padding: '4px',
              backgroundColor: '#fff',
              border: '1px solid #d0d0d0',
              borderRadius: '2px',
            }}
          >
            {shapes.map((shape) => {
              const Icon = shape.icon;
              return (
                <button
                  key={shape.name}
                  onClick={() => onSettingsChange({ ...settings, tool: shape.name })}
                  title={shape.label}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '6px',
                    backgroundColor: settings.tool === shape.name ? '#cce8ff' : 'transparent',
                    border: settings.tool === shape.name ? '1px solid #0078d7' : '1px solid transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (settings.tool !== shape.name) {
                      e.currentTarget.style.backgroundColor = '#e5f3ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (settings.tool !== shape.name) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={16} color="#000" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '80px', backgroundColor: '#d0d0d0', margin: '0 4px' }} />

        {/* Size & Outline/Fill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Size */}
          <div>
            <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Size</div>
            <select
              value={settings.strokeWidth}
              onChange={(e) => onSettingsChange({ ...settings, strokeWidth: parseInt(e.target.value) })}
              style={{
                padding: '4px 24px 4px 8px',
                border: '1px solid #ababab',
                borderRadius: '2px',
                backgroundColor: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {[1, 2, 3, 5, 8, 12, 16, 20].map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          {/* Outline & Fill */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Outline</div>
              <div
                style={{
                  width: '48px',
                  height: '28px',
                  backgroundColor: settings.strokeColor,
                  border: '2px solid #000',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
                title="Outline color"
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Fill</div>
              <div
                style={{
                  width: '48px',
                  height: '28px',
                  backgroundColor: settings.fillColor,
                  border: '2px solid #000',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
                title="Fill color"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '80px', backgroundColor: '#d0d0d0', margin: '0 4px' }} />

        {/* Color Palette */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Colors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {PRIMARY_COLORS.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', gap: '2px' }}>
                {row.map((color) => (
                  <div
                    key={color}
                    onClick={() => {
                      // Left click sets stroke color, we'll use it for both for simplicity
                      onSettingsChange({ ...settings, strokeColor: color, fillColor: color });
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color,
                      border: '1px solid #8a8a8a',
                      cursor: 'pointer',
                      boxShadow:
                        settings.strokeColor === color || settings.fillColor === color
                          ? 'inset 0 0 0 2px #fff, inset 0 0 0 3px #000'
                          : 'none',
                    }}
                    title={color}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div
        style={{
          padding: '2px 8px',
          backgroundColor: '#fff',
          borderTop: '1px solid #d0d0d0',
          fontSize: '10px',
          color: '#666',
        }}
      >
        <strong>Tip:</strong> Draw freehand - shapes auto-correct! | Use SELECT tool to connect shapes | Double-click shapes to add labels
      </div>
    </div>
  );
}
