import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

export default function AddList({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  if (!isAdding) {
    return (
      <div className="list-wrapper">
        <button 
          className="btn-add-card" 
          style={{background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 12, height: 48, fontWeight: 600}} 
          onClick={() => setIsAdding(true)}
        >
          <FiPlus /> Add another list
        </button>
      </div>
    );
  }

  return (
    <div className="list-wrapper">
      <div className="list-container" style={{padding: 12}}>
        <input
          ref={inputRef}
          className="premium-input"
          style={{marginBottom: 8}}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          onKeyDown={(e) => e.key === 'Enter' && (onAdd(title), setTitle(''))}
        />
        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          <button className="btn btn-primary" onClick={() => (onAdd(title), setTitle(''))}>Add list</button>
          <FiX onClick={() => setIsAdding(false)} cursor="pointer" size={24} />
        </div>
      </div>
    </div>
  );
}
