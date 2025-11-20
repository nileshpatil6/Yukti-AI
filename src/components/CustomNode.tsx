import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ComponentData } from '../types';

interface CustomNodeData {
  label: string;
  component: ComponentData;
  customText?: string;
  properties?: Record<string, any>;
}

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.customText || data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.customText = text;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.customText = text;
    }
  };

  return (
    <div
      className={`custom-node ${selected ? 'selected' : ''}`}
      style={{
        padding: '18px 24px',
        borderRadius: '12px',
        border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
        backgroundColor: 'white',
        minWidth: '180px',
        boxShadow: selected ? '0 8px 24px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)' : '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'grab',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input handles */}
      {data.component.inputs !== 0 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            width: 14, 
            height: 14,
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.35)',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Icon */}
        <div style={{ 
          fontSize: '32px', 
          textAlign: 'center',
          marginBottom: '4px',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        }}>
          {data.component.icon}
        </div>

        {/* Label */}
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        ) : (
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              textAlign: 'center',
              wordBreak: 'break-word',
              color: '#111827',
              letterSpacing: '-0.01em',
              lineHeight: '1.4',
            }}
          >
            {text}
          </div>
        )}

        {/* Category badge */}
        <div
          style={{
            fontSize: '10px',
            backgroundColor: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '6px',
            textAlign: 'center',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          {data.component.category}
        </div>
      </div>

      {/* Output handles */}
      {data.component.outputs !== 0 && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            width: 14, 
            height: 14,
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
          }}
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
