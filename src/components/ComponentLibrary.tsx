import { useState } from 'react';
import { Search } from 'lucide-react';
import { COMPONENT_LIBRARY, CATEGORIES } from '../data/componentLibrary';
import { ComponentData } from '../types';

interface ComponentLibraryProps {
  onDragStart: (component: ComponentData) => void;
}

export const ComponentLibrary = ({ onDragStart }: ComponentLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComponents = COMPONENT_LIBRARY.filter((comp) => {
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch = comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (event: React.DragEvent, component: ComponentData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
    onDragStart(component);
  };

  return (
    <div className="component-library" style={{
      width: '320px',
      height: '100vh',
      backgroundColor: '#f9fafb',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
          Component Library
        </h2>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: selectedCategory === 'all' ? '#3b82f6' : '#fff',
            color: selectedCategory === 'all' ? '#fff' : '#374151',
            transition: 'all 0.2s',
          }}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              backgroundColor: selectedCategory === cat.id ? cat.color : '#fff',
              color: selectedCategory === cat.id ? '#fff' : '#374151',
              transition: 'all 0.2s',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Component List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '12px',
        }}>
          {filteredComponents.length} components
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'grab',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '24px' }}>{component.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                    {component.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {component.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
