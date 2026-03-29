import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { createBoard } from '../api';

const BOARD_COLORS = [
  '#0079BF', '#519839', '#D29034', '#B04632',
  '#89609E', '#CD5A91', '#4BBF6B', '#00AECC', '#838C91'
];

export default function CreateBoardModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [bgColor, setBgColor] = useState(BOARD_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard({ title: title.trim(), background_color: bgColor });
      onCreated(board);
    } catch (err) {
      console.error('Failed to create board:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-board-modal" onClick={onClose}>
      <div className="create-board-content" onClick={(e) => e.stopPropagation()}>
        <div className="create-board-preview" style={{ background: bgColor }}>
          <span className="create-board-preview-text">{title || 'Board title'}</span>
        </div>

        <label>Board title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          placeholder="Enter board title..."
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />

        <label>Background</label>
        <div className="color-picker-grid">
          {BOARD_COLORS.map((color) => (
            <div
              key={color}
              className={`color-picker-swatch ${bgColor === color ? 'selected' : ''}`}
              style={{ background: color }}
              onClick={() => setBgColor(color)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            style={{ flex: 1 }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button className="btn btn-subtle" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
