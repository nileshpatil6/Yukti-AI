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
        padding: '12px 20px',
        borderRadius: '8px',
        border: `2px solid ${selected ? '#3b82f6' : '#d1d5db'}`,
        backgroundColor: 'white',
        minWidth: '150px',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input handles */}
      {data.component.inputs !== 0 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#3b82f6', width: 10, height: 10 }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Icon */}
        <div style={{ fontSize: '24px', textAlign: 'center' }}>
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
              fontSize: '12px',
              fontWeight: 500,
              textAlign: 'center',
              wordBreak: 'break-word',
              color: '#374151',
            }}
          >
            {text}
          </div>
        )}

        {/* Category badge */}
        <div
          style={{
            fontSize: '9px',
            backgroundColor: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#6b7280',
            textTransform: 'uppercase',
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
          style={{ background: '#10b981', width: 10, height: 10 }}
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
