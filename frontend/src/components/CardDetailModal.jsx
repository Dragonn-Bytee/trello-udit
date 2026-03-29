import { useState, useEffect, useRef } from 'react';
import {
  FiX, FiCreditCard, FiAlignLeft, FiCheckSquare, FiClock,
  FiTag, FiUser, FiMessageSquare, FiTrash2, FiArchive, FiPaperclip
} from 'react-icons/fi';
import { format } from 'date-fns';
import {
  getCard, updateCard, deleteCard,
  addCardLabel, removeCardLabel,
  addCardMember, removeCardMember,
  addChecklist, deleteChecklist,
  addChecklistItem, updateChecklistItem, deleteChecklistItem,
  addComment, deleteComment
} from '../api';

export default function CardDetailModal({ cardId, boardLabels, boardMembers, onClose, onUpdate, isReadOnly }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activePopover, setActivePopover] = useState(null);
  const [newChecklistTitle, setNewChecklistTitle] = useState('Checklist');
  const [addingItemTo, setAddingItemTo] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const modalRef = useRef(null);

  const fetchCard = async () => {
    try {
      const data = await getCard(cardId);
      setCard(data);
      setDescription(data.description || '');
      setDueDateInput(data.due_date ? format(new Date(data.due_date), 'yyyy-MM-dd') : '');
    } catch (err) {
      console.error('Failed to load card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCard(); }, [cardId]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (activePopover) {
          setActivePopover(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, activePopover]);

  const handleTitleChange = async (newTitle) => {
    if (!newTitle.trim() || newTitle === card.title) return;
    try {
      await updateCard(cardId, { title: newTitle.trim() });
      setCard((prev) => ({ ...prev, title: newTitle.trim() }));
      onUpdate();
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleDescSave = async () => {
    setEditingDesc(false);
    try {
      await updateCard(cardId, { description: description || null });
      setCard((prev) => ({ ...prev, description }));
      onUpdate();
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  };

  const handleToggleLabel = async (labelId) => {
    const hasLabel = card.labels.some((l) => l.id === labelId);
    try {
      if (hasLabel) {
        await removeCardLabel(cardId, labelId);
        setCard((prev) => ({ ...prev, labels: prev.labels.filter((l) => l.id !== labelId) }));
      } else {
        await addCardLabel(cardId, labelId);
        const label = boardLabels.find((l) => l.id === labelId);
        setCard((prev) => ({ ...prev, labels: [...prev.labels, label] }));
      }
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle label:', err);
    }
  };

  const handleToggleMember = async (memberId) => {
    const hasMember = card.members.some((m) => m.id === memberId);
    try {
      if (hasMember) {
        await removeCardMember(cardId, memberId);
        setCard((prev) => ({ ...prev, members: prev.members.filter((m) => m.id !== memberId) }));
      } else {
        const member = await addCardMember(cardId, memberId);
        setCard((prev) => ({ ...prev, members: [...prev.members, member] }));
      }
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle member:', err);
    }
  };

  const handleSetDueDate = async () => {
    try {
      const date = dueDateInput || null;
      await updateCard(cardId, { due_date: date });
      setCard((prev) => ({ ...prev, due_date: date }));
      setActivePopover(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to set due date:', err);
    }
  };

  const handleRemoveDueDate = async () => {
    try {
      await updateCard(cardId, { due_date: null });
      setCard((prev) => ({ ...prev, due_date: null }));
      setDueDateInput('');
      setActivePopover(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to remove due date:', err);
    }
  };

  const handleToggleDueComplete = async () => {
    try {
      await updateCard(cardId, { due_complete: !card.due_complete });
      setCard((prev) => ({ ...prev, due_complete: !prev.due_complete }));
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle due complete:', err);
    }
  };

  const handleAddChecklist = async () => {
    try {
      const cl = await addChecklist(cardId, newChecklistTitle);
      setCard((prev) => ({ ...prev, checklists: [...prev.checklists, cl] }));
      setActivePopover(null);
      setNewChecklistTitle('Checklist');
      onUpdate();
    } catch (err) {
      console.error('Failed to add checklist:', err);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      await deleteChecklist(cardId, checklistId);
      setCard((prev) => ({ ...prev, checklists: prev.checklists.filter((c) => c.id !== checklistId) }));
      onUpdate();
    } catch (err) {
      console.error('Failed to delete checklist:', err);
    }
  };

  const handleAddChecklistItem = async (checklistId) => {
    if (!newItemTitle.trim()) return;
    try {
      const item = await addChecklistItem(cardId, checklistId, newItemTitle.trim());
      setCard((prev) => ({
        ...prev,
        checklists: prev.checklists.map((cl) =>
          cl.id === checklistId ? { ...cl, items: [...cl.items, item] } : cl
        ),
      }));
      setNewItemTitle('');
      onUpdate();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleToggleChecklistItem = async (checklistId, itemId, isChecked) => {
    try {
      await updateChecklistItem(cardId, checklistId, itemId, { is_checked: !isChecked });
      setCard((prev) => ({
        ...prev,
        checklists: prev.checklists.map((cl) =>
          cl.id === checklistId
            ? {
                ...cl,
                items: cl.items.map((item) =>
                  item.id === itemId ? { ...item, is_checked: !isChecked } : item
                ),
              }
            : cl
        ),
      }));
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleDeleteChecklistItem = async (checklistId, itemId) => {
    try {
      await deleteChecklistItem(cardId, checklistId, itemId);
      setCard((prev) => ({
        ...prev,
        checklists: prev.checklists.map((cl) =>
          cl.id === checklistId
            ? { ...cl, items: cl.items.filter((item) => item.id !== itemId) }
            : cl
        ),
      }));
      onUpdate();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const comment = await addComment(cardId, commentText.trim());
      setCard((prev) => ({ ...prev, comments: [comment, ...prev.comments] }));
      setCommentText('');
      onUpdate();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(cardId, commentId);
      setCard((prev) => ({ ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleArchive = async () => {
    try {
      await updateCard(cardId, { is_archived: true });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to archive card:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card? This action cannot be undone.')) return;
    try {
      await deleteCard(cardId);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleCoverColor = async (color) => {
    try {
      await updateCard(cardId, { cover_color: color === card.cover_color ? null : color });
      setCard((prev) => ({ ...prev, cover_color: color === prev.cover_color ? null : color }));
      onUpdate();
    } catch (err) {
      console.error('Failed to update cover:', err);
    }
  };

  if (loading || !card) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="card-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: 40, textAlign: 'center', color: '#5E6C84' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`card-modal ${!card.cover_color ? 'card-modal-no-cover' : ''}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {card.cover_color && (
          <div className="card-modal-cover" style={{ backgroundColor: card.cover_color }} />
        )}

        <button className="card-modal-close" onClick={onClose}>
          <FiX />
        </button>

        {/* Header */}
        <div className="card-modal-header">
          <span className="card-modal-header-icon"><FiCreditCard /></span>
          <textarea
            className="card-modal-title"
            value={card.title}
            readOnly={isReadOnly}
            onChange={(e) => !isReadOnly && setCard((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={(e) => !isReadOnly && handleTitleChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            rows={1}
          />
          <div className="card-modal-subtitle">
            in list <strong>{card.list_title}</strong>
          </div>
        </div>

        <div className="card-modal-body">
          {/* Main content */}
          <div className="card-modal-main">
            {/* Labels & Members & Due date row */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16, paddingLeft: 40 }}>
              {card.members && card.members.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 4 }}>Members</div>
                  <div className="card-modal-members" style={{ paddingLeft: 0, marginBottom: 0 }}>
                    {card.members.map((m) => (
                      <div
                        key={m.id}
                        className="avatar avatar-xs"
                        style={{ background: m.avatar_color }}
                        title={m.full_name}
                      >
                        {m.initials}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {card.labels && card.labels.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 4 }}>Labels</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {card.labels.map((l) => (
                      <span key={l.id} className="card-modal-label" style={{ backgroundColor: l.color }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {card.due_date && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 4 }}>Due date</div>
                  <div className="due-date-badge">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={card.due_complete || false}
                      onChange={handleToggleDueComplete}
                    />
                    {format(new Date(card.due_date), 'MMM d, yyyy')}
                    {card.due_complete && (
                      <span style={{ background: '#61BD4F', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 12, marginLeft: 4 }}>
                        complete
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card-section">
              <div className="card-section-header">
                <FiAlignLeft className="card-section-header-icon" />
                <h3>Description</h3>
                {!isReadOnly && card.description && !editingDesc && (
                  <button className="btn btn-subtle" onClick={() => setEditingDesc(true)} style={{ marginLeft: 'auto' }}>
                    Edit
                  </button>
                )}
              </div>
              <div className="description-editor">
                {editingDesc ? (
                  <>
                    <textarea
                      className="description-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      autoFocus
                      placeholder="Add a more detailed description..."
                    />
                    <div className="add-form-actions" style={{ marginTop: 8 }}>
                      <button className="btn btn-primary" onClick={handleDescSave}>Save</button>
                      <button className="btn btn-subtle" onClick={() => { setEditingDesc(false); setDescription(card.description || ''); }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <div
                    className="description-placeholder"
                    onClick={() => !isReadOnly && setEditingDesc(true)}
                    style={card.description ? { background: 'transparent', padding: 0, whiteSpace: 'pre-wrap' } : {}}
                  >
                    {card.description || 'Add a more detailed description...'}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {card.checklists && card.checklists.map((cl) => {
              const total = cl.items.length;
              const done = cl.items.filter((i) => i.is_checked).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={cl.id} className="card-section">
                  <div className="card-section-header">
                    <FiCheckSquare className="card-section-header-icon" />
                    <h3>{cl.title}</h3>
                    <button
                      className="btn btn-subtle"
                      onClick={() => handleDeleteChecklist(cl.id)}
                      style={{ marginLeft: 'auto' }}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="checklist">
                    <div className="checklist-progress">
                      <div className="checklist-progress-text">{pct}%</div>
                      <div className="checklist-progress-bar">
                        <div
                          className={`checklist-progress-fill ${pct === 100 ? 'complete' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {cl.items.map((item) => (
                      <div key={item.id} className="checklist-item">
                        <input
                          type="checkbox"
                          checked={item.is_checked}
                          onChange={() => handleToggleChecklistItem(cl.id, item.id, item.is_checked)}
                        />
                        <span className={`checklist-item-text ${item.is_checked ? 'checked' : ''}`}>
                          {item.title}
                        </span>
                        <button
                          className="checklist-item-delete"
                          onClick={() => handleDeleteChecklistItem(cl.id, item.id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {addingItemTo === cl.id ? (
                      <div style={{ marginTop: 8 }}>
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="Add an item"
                          autoFocus
                          style={{ width: '100%', padding: '6px 8px', border: '2px solid #0079BF', borderRadius: 4, fontSize: 14 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddChecklistItem(cl.id);
                            if (e.key === 'Escape') { setAddingItemTo(null); setNewItemTitle(''); }
                          }}
                        />
                        <div className="add-form-actions" style={{ marginTop: 4 }}>
                          <button className="btn btn-primary" onClick={() => handleAddChecklistItem(cl.id)}>Add</button>
                          <button className="btn btn-subtle" onClick={() => { setAddingItemTo(null); setNewItemTitle(''); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="checklist-add-item-btn" onClick={() => setAddingItemTo(cl.id)}>
                        Add an item
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Activity / Comments */}
            <div className="card-section">
              <div className="card-section-header">
                <FiMessageSquare className="card-section-header-icon" />
                <h3>Activity</h3>
              </div>

              <div className="comment-input-container">
                <div className="avatar avatar-xs" style={{ background: '#0079BF' }}>UK</div>
                <textarea
                  className="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                />
              </div>
              {commentText.trim() && (
                <div style={{ paddingLeft: 72, marginBottom: 16 }}>
                  <button className="btn btn-primary" onClick={handleAddComment}>Save</button>
                </div>
              )}

              <div className="activity-feed">
                {/* Combined comments and activity log */}
                {[
                  ...(card.comments || []).map(c => ({ ...c, type: 'comment' })),
                  ...(card.activity || []).map(a => ({ ...a, type: 'log' }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((item, idx) => (
                  item.type === 'comment' ? (
                    <div key={`c-${item.id}`} className="comment">
                      <div className="avatar avatar-xs" style={{ background: item.avatar_color || '#0079BF' }}>
                        {item.initials || '??'}
                      </div>
                      <div className="comment-body">
                        <span className="comment-author">{item.full_name || 'Unknown'}</span>
                        <span className="comment-time">
                          {format(new Date(item.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </span>
                        <div className="comment-text">{item.text}</div>
                        <div className="comment-actions">
                          <button onClick={() => handleDeleteComment(item.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={`a-${idx}`} className="activity-log-item">
                      <div className="avatar avatar-xs" style={{ background: item.avatar_color || '#5E6C84' }}>
                        {item.initials || '??'}
                      </div>
                      <div className="activity-body">
                        <span className="activity-author">{item.full_name || 'System'}</span>
                        <span className="activity-text">{item.description}</span>
                        <span className="comment-time">
                          {format(new Date(item.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="card-modal-sidebar">
            {!isReadOnly && (
              <div className="sidebar-section">
                <div className="sidebar-section-title">Add to card</div>

                <button className="sidebar-btn" onClick={() => setActivePopover(activePopover === 'members' ? null : 'members')}>
                  <FiUser /> Members
                </button>

                <button className="sidebar-btn" onClick={() => setActivePopover(activePopover === 'labels' ? null : 'labels')}>
                  <FiTag /> Labels
                </button>

                <button className="sidebar-btn" onClick={() => setActivePopover(activePopover === 'checklist' ? null : 'checklist')}>
                  <FiCheckSquare /> Checklist
                </button>

                <button className="sidebar-btn" onClick={() => setActivePopover(activePopover === 'date' ? null : 'date')}>
                  <FiClock /> Dates
                </button>
              </div>
            )}

            {!isReadOnly && (
              <div className="sidebar-section">
                <div className="sidebar-section-title">Actions</div>
                <button className="sidebar-btn" onClick={handleArchive}>
                  <FiArchive /> Archive
                </button>
                <button className="sidebar-btn" onClick={handleDelete} style={{ color: '#EB5A46' }}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}

            {/* Popovers */}
            {activePopover === 'labels' && (
              <div className="popover" style={{ position: 'absolute', top: 60, right: 0 }}>
                <div className="popover-header">
                  <h4>Labels</h4>
                  <button className="popover-close" onClick={() => setActivePopover(null)}>
                    <FiX />
                  </button>
                </div>
                <div className="popover-body">
                  {boardLabels.map((label) => {
                    const isActive = card.labels.some((l) => l.id === label.id);
                    return (
                      <div key={label.id} className="label-picker-item" onClick={() => handleToggleLabel(label.id)}>
                        <div className="label-picker-color" style={{ backgroundColor: label.color }}>
                          {label.name}
                        </div>
                        <div className="label-picker-check">{isActive ? '✓' : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activePopover === 'members' && (
              <div className="popover" style={{ position: 'absolute', top: 30, right: 0 }}>
                <div className="popover-header">
                  <h4>Members</h4>
                  <button className="popover-close" onClick={() => setActivePopover(null)}>
                    <FiX />
                  </button>
                </div>
                <div className="popover-body">
                  {boardMembers.map((member) => {
                    const isActive = card.members.some((m) => m.id === member.id);
                    return (
                      <div
                        key={member.id}
                        className="member-picker-item"
                        onClick={() => handleToggleMember(member.id)}
                      >
                        <div className="avatar avatar-xs" style={{ background: member.avatar_color }}>
                          {member.initials}
                        </div>
                        <span style={{ flex: 1 }}>{member.full_name}</span>
                        {isActive && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activePopover === 'checklist' && (
              <div className="popover" style={{ position: 'absolute', top: 90, right: 0 }}>
                <div className="popover-header">
                  <h4>Add Checklist</h4>
                  <button className="popover-close" onClick={() => setActivePopover(null)}>
                    <FiX />
                  </button>
                </div>
                <div className="popover-body">
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Title</label>
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: '2px solid #DFE1E6', borderRadius: 4, fontSize: 14, marginBottom: 8 }}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklist(); }}
                  />
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddChecklist}>
                    Add
                  </button>
                </div>
              </div>
            )}

            {activePopover === 'date' && (
              <div className="popover" style={{ position: 'absolute', top: 120, right: 0 }}>
                <div className="popover-header">
                  <h4>Date</h4>
                  <button className="popover-close" onClick={() => setActivePopover(null)}>
                    <FiX />
                  </button>
                </div>
                <div className="popover-body">
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Due date</label>
                  <input
                    type="date"
                    className="date-picker-input"
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <button className="btn btn-primary" style={{ width: '100%', marginBottom: 4 }} onClick={handleSetDueDate}>
                    Save
                  </button>
                  {card.due_date && (
                    <button className="btn btn-subtle" style={{ width: '100%' }} onClick={handleRemoveDueDate}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
