import { Square, Circle, Triangle, Minus, MoveUpRight, Hand } from 'lucide-react';
import { DrawingTool } from '../types/drawing';

interface DrawingToolbarProps {
  selectedTool: DrawingTool | null;
  onToolSelect: (tool: DrawingTool | null) => void;
}

export function DrawingToolbar({ selectedTool, onToolSelect }: DrawingToolbarProps) {
  const tools: Array<{ id: DrawingTool; icon: React.ReactNode; label: string }> = [
    { id: 'freehand', icon: <Hand size={18} />, label: 'Freehand' },
    { id: 'rectangle', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle' },
    { id: 'line', icon: <Minus size={18} />, label: 'Line' },
    { id: 'arrow', icon: <MoveUpRight size={18} />, label: 'Arrow' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      backgroundColor: 'white',
      padding: '8px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '6px',
      zIndex: 100,
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#6b7280',
        padding: '8px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2px',
        textAlign: 'center',
      }}>
        Drawing Tools
      </div>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          title={tool.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: selectedTool === tool.id ? '#3b82f6' : '#f9fafb',
            color: selectedTool === tool.id ? 'white' : '#374151',
            border: selectedTool === tool.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            if (selectedTool !== tool.id) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTool !== tool.id) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
