import React, { useState } from 'react';
import { FiX, FiLink, FiCopy, FiCheck, FiUsers, FiGlobe, FiLock } from 'react-icons/fi';

export default function ShareModal({ board, onClose, onVisibilityChange }) {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}/board/${board.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={e => e.stopPropagation()} style={{ width: 440, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Share Board</h2>
          <FiX onClick={onClose} cursor="pointer" size={24} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#8C9BAB', marginBottom: 8 }}>
            BOARD VISIBILITY
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <div 
              className={`visibility-option ${board.visibility === 'workspace' || !board.visibility ? 'active' : ''}`}
              style={{ flex: 1, padding: 12, border: '1px solid #444', borderRadius: 8, cursor: 'pointer' }}
              onClick={() => onVisibilityChange('workspace')}
            >
              <FiUsers size={20} />
              <div style={{ fontSize: 13, marginTop: 4 }}>Workspace</div>
            </div>
            <div 
              className={`visibility-option ${board.visibility === 'public' ? 'active' : ''}`}
              style={{ flex: 1, padding: 12, border: '1px solid #444', borderRadius: 8, cursor: 'pointer' }}
              onClick={() => onVisibilityChange('public')}
            >
              <FiGlobe size={20} />
              <div style={{ fontSize: 13, marginTop: 4 }}>Public</div>
            </div>
            <div 
              className={`visibility-option ${board.visibility === 'private' ? 'active' : ''}`}
              style={{ flex: 1, padding: 12, border: '1px solid #444', borderRadius: 8, cursor: 'pointer' }}
              onClick={() => onVisibilityChange('private')}
            >
              <FiLock size={20} />
              <div style={{ fontSize: 13, marginTop: 4 }}>Private</div>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#8C9BAB', marginBottom: 8 }}>
            SHARE LINK
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ 
              background: '#22272B', 
              padding: '8px 12px', 
              borderRadius: 6, 
              flex: 1, 
              fontSize: 13, 
              border: '1px solid #444',
              color: '#B6C2CF',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {shareLink}
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}
            >
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#8C9BAB', marginTop: 12 }}>
            {board.visibility === 'public' 
              ? '🔓 Anyone with this link can view this board.' 
              : '🔒 Only members can access this board.'}
          </p>
        </div>
      </div>
    </div>
  );
}
