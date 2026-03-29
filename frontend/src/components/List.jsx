import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { FiMoreHorizontal, FiPlus, FiX } from 'react-icons/fi';
import Card from './Card';
import { createCard } from '../api';

export default function List({
  list, index, onOpenCard, onUpdateList, onDeleteList, onAddCard, isReadOnly
}) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (showAddCard && textareaRef.current) textareaRef.current.focus();
  }, [showAddCard]);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    const title = newCardTitle.trim();
    setNewCardTitle('');
    
    if (onAddCard) {
      await onAddCard(list.id, title);
    } else {
      try {
        await createCard({ list_id: list.id, title });
        window.location.reload(); // Fallback if no onAddCard provided
      } catch (e) {
        console.error(e);
      }
    }
  };

  const portal = document.getElementById('portal-root') || document.body;

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => {
        const child = (
          <div 
            ref={provided.innerRef} 
            {...provided.draggableProps} 
            className="list-wrapper"
          >
            <div className="list-container" {...provided.dragHandleProps}>
              <div className="list-header">
                <div 
                  className="list-title" 
                  contentEditable={!isReadOnly} 
                  onBlur={(e) => !isReadOnly && onUpdateList(list.id, {title: e.target.innerText})}
                >
                  {list.title}
                </div>
                {!isReadOnly && <FiMoreHorizontal cursor="pointer" onClick={() => onDeleteList(list.id)} />}
              </div>

              <Droppable droppableId={`${list.id}`} type="card">
                {(provided) => (
                  <div 
                    className="list-cards" 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    style={{ minHeight: '50px' }} // Ensure empty lists are drop targets
                  >
                    {list.cards.map((card, idx) => (
                      <Card 
                        key={card.id} 
                        card={card} 
                        index={idx} 
                        onClick={() => onOpenCard(card.id)} 
                      />
                    ))}
                    {provided.placeholder}
                    
                    {showAddCard && (
                      <div style={{padding: '0 8px 8px'}}>
                        <textarea
                          ref={textareaRef}
                          className="premium-input"
                          style={{width: '100%', minHeight: 60, marginBottom: 8}}
                          placeholder="Enter a title for this card..."
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                        />
                        <div style={{display: 'flex', gap: 8}}>
                           <button className="btn btn-primary" onClick={handleAddCard}>Add card</button>
                           <FiX onClick={() => setShowAddCard(false)} cursor="pointer" size={24} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>

              {!isReadOnly && !showAddCard && (
                <button className="btn-add-card" onClick={() => setShowAddCard(true)}>
                  <FiPlus /> Add a card
                </button>
              )}
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
