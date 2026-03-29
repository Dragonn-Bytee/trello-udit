import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { 
  FiEdit2, FiClock, FiCheckSquare, FiMessageCircle, FiPaperclip, 
  FiPlay, FiEye, FiActivity, FiShare2 
} from 'react-icons/fi';
import { format, isPast, isBefore, addDays } from 'date-fns';

export default function Card({ card, index, onClick, labelsExpanded, onToggleLabels }) {
  const hasLabels = card.labels && card.labels.length > 0;
  const checklistTotal = parseInt(card.checklist_total) || 0;
  const checklistDone = parseInt(card.checklist_done) || 0;
  const commentCount = parseInt(card.comment_count) || 0;
  const attachmentCount = parseInt(card.attachment_count) || 0;

  // Visual cues based on title for demonstration (Premium Trello Look)
  const isVideo = card.title.toLowerCase().includes('starter') || card.title.toLowerCase().includes('loom');
  const isImage = card.title.toLowerCase().includes('capture') || card.title.toLowerCase().includes('design');

  const getDueBadgeClass = () => {
    if (!card.due_date) return '';
    if (card.due_complete) return 'due-complete';
    const due = new Date(card.due_date);
    if (isPast(due)) return 'due-overdue';
    if (isBefore(due, addDays(new Date(), 1))) return 'due-soon';
    return '';
  };

  const portal = document.getElementById('portal-root') || document.body;

  return (
    <Draggable draggableId={`card-${card.id}`} index={index}>
      {(provided, snapshot) => {
        const child = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`card-item ${snapshot.isDragging ? 'card-dragging' : ''}`}
            onClick={onClick}
          >
            {/* Card Cover (Premium Trello Look) */}
            {(card.cover_image || isVideo || isImage) && (
              <div className="card-video-thumb">
                <img 
                  src={card.cover_image || (isVideo ? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80')} 
                  alt="card cover" 
                />
                {isVideo && (
                  <div className="video-play-overlay">
                    <div className="play-btn"><FiPlay style={{marginLeft: 4}} /></div>
                  </div>
                )}
              </div>
            )}

            <div className="card-details">
              {hasLabels && (
                <div className="card-label-row">
                  {card.labels.map(l => (
                    <div key={l.id} className="card-label" style={{background: l.color}} />
                  ))}
                </div>
              )}
              
              {/* Show expanded labels for certain titles as seen in demo screenshots */}
              {isVideo && (
                <div style={{marginBottom: 8}}>
                  <div className="premium-label" style={{background: '#38414A'}}>
                     <FiPlay /> New to Trello? Start here
                  </div>
                  <div className="premium-label" style={{background: '#38414A', marginTop: 4, width: 'fit-content'}}>
                     <FiActivity /> Loom <FiShare2 style={{marginLeft: 8}} />
                  </div>
                </div>
              )}

              <div className="card-text">{card.title}</div>
              
              <div className="card-footer">
                {card.due_date && (
                  <div className={`card-badge ${getDueBadgeClass()}`}>
                    <FiClock /> {format(new Date(card.due_date), 'MMM d')}
                  </div>
                )}
                {commentCount > 0 && <div className="card-badge"><FiMessageCircle /> {commentCount}</div>}
                {attachmentCount > 0 && <div className="card-badge"><FiPaperclip /> {attachmentCount}</div>}
                {checklistTotal > 0 && (
                  <div className="card-badge"><FiCheckSquare /> {checklistDone}/{checklistTotal}</div>
                )}
              </div>
            </div>
          </div>
        );

        if (snapshot.isDragging) {
          return createPortal(child, portal);
        }
        return child;
      }}
    </Draggable>
  );
}
