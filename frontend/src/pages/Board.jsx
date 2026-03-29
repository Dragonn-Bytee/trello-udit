import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { 
  FiStar, FiFilter, FiMoreHorizontal, FiShare2, FiGlobe, 
  FiLock, FiUsers, FiLayout, FiInbox, FiCalendar, FiGrid, 
  FiChevronLeft, FiPlay, FiTag, FiCheckSquare, FiMessageCircle,
  FiPaperclip, FiPlus, FiX, FiSearch
} from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';
import Navbar from '../components/Navbar';
import List from '../components/List';
import AddList from '../components/AddList';
import CardDetailModal from '../components/CardDetailModal';
import CreateBoardModal from '../components/CreateBoardModal';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';
import {
  getBoard, updateBoard, createList, updateList, deleteList,
  reorderLists, createCard, reorderCards, getMembers, deleteCard,
  inviteBoardMemberByEmail
} from '../api';

export default function Board() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  
  // UI Panels
  const [showInbox, setShowInbox] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFilterPop, setShowFilterPop] = useState(false);
  const [filterPos, setFilterPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterText, setFilterText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showVisibilityPop, setShowVisibilityPop] = useState(false);
  const [visibilityPos, setVisibilityPos] = useState({ x: 0, y: 0 });
  const [showBackgroundPop, setShowBackgroundPop] = useState(false);
  const [backgroundPos, setBackgroundPos] = useState({ x: 0, y: 0 });
  const [showCreate, setShowCreate] = useState(false);
  
  const visibilityRef = useRef(null);
  const backgroundBtnRef = useRef(null);
  const filterBtnRef = useRef(null);
  const filterPopRef = useRef(null);

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(id);
      setBoard(data);
    } catch (err) {
      console.error('Failed to load board:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const isReadOnly = !user && board?.visibility === 'public';

  useEffect(() => {
    fetchBoard();
    getMembers().then(setAllMembers).catch(console.error);
  }, [fetchBoard]);

  const handleCreateLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setToastMsg('Board link copied to clipboard! Share this with others to collaborate.');
      setShowToast(true);
    });
  };

  const handleBoardInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const member = await inviteBoardMemberByEmail(id, inviteEmail);
      setBoard(prev => ({
        ...prev,
        members: [...prev.members.filter(m => m.id !== member.id), member]
      }));
      setInviteEmail('');
      alert(`User ${member.full_name} added successfully!`);
    } catch (err) {
      alert(err.response?.data?.error || 'User not found. Ensure they have an account.');
    }
  };

  const backgrounds = [
    { name: 'Trello Purple', image: '/backgrounds/purple.png' },
    { name: 'Deep Space', image: '/backgrounds/abstract.png' },
    { name: 'Twilight Peak', image: '/backgrounds/mountain.png' },
    { name: 'Zen Workspace', image: '/backgrounds/workspace.png' },
    { name: 'Solid Blue', color: '#0079BF' },
    { name: 'Solid Purple', color: '#89609E' },
    { name: 'Solid Dark', color: '#101204' },
  ];

  const handleBackgroundChange = async (bg) => {
    try {
      const updateData = bg.image 
        ? { background_image: bg.image, background_color: null }
        : { background_color: bg.color, background_image: null };
      
      await updateBoard(id, updateData);
      setBoard(prev => ({ ...prev, ...updateData }));
    } catch (err) {
      console.error('Failed to update background:', err);
    }
  };

  const handleVisibilityChange = async (visibility) => {
    try {
      await updateBoard(id, { visibility });
      setBoard(prev => ({ ...prev, visibility }));
      setShowVisibilityPop(false);
    } catch (err) {
      console.error('Failed to update visibility:', err);
    }
  };

  useEffect(() => {
    function handleMouseMove(e) {
      if (isDragging) {
        setFilterPos({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    function handleClickOutside(e) {
      if (visibilityRef.current && !visibilityRef.current.contains(e.target)) {
        setShowVisibilityPop(false);
      }
      if (filterPopRef.current && !filterPopRef.current.contains(e.target) && !filterBtnRef.current.contains(e.target)) {
        setShowFilterPop(false);
      }
      if (backgroundBtnRef.current && !backgroundBtnRef.current.contains(e.target)) {
        setShowBackgroundPop(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const toggleStar = async () => {
    try {
      await updateBoard(id, { is_starred: !board.is_starred });
      setBoard((prev) => ({ ...prev, is_starred: !prev.is_starred }));
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'list') {
      const newLists = Array.from(board.lists);
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      const updatedLists = newLists.map((l, i) => ({ ...l, position: (i + 1) * 1000 }));
      setBoard(prev => ({ ...prev, lists: updatedLists }));
      try {
        await reorderLists(updatedLists.map(l => ({ id: l.id, position: l.position })));
      } catch (err) {
        console.error('Failed to persist list reorder:', err);
        fetchBoard();
      }
      return;
    }

    const cardId = draggableId.replace('card-', '');
    const sourceListId = String(source.droppableId);
    const destListId = String(destination.droppableId);
    const newLists = board.lists.map(l => ({ ...l, cards: Array.from(l.cards) }));
    const sourceList = newLists.find(l => String(l.id) === sourceListId);
    const destList = newLists.find(l => String(l.id) === destListId);

    if (!sourceList || !destList) return;

    const cardIndexInSource = sourceList.cards.findIndex(c => String(c.id) === cardId);
    const [movedCard] = sourceList.cards.splice(cardIndexInSource, 1);
    movedCard.list_id = destList.id;

    const destVisibleCards = destList.cards.filter(c => 
      !filterText || c.title.toLowerCase().includes(filterText.toLowerCase())
    );

    let finalDestIndex;
    if (destination.index >= destVisibleCards.length) {
      finalDestIndex = destVisibleCards.length === 0 ? destList.cards.length : destList.cards.findIndex(c => String(c.id) === String(destVisibleCards[destVisibleCards.length - 1].id)) + 1;
    } else {
      finalDestIndex = destList.cards.findIndex(c => String(c.id) === String(destVisibleCards[destination.index].id));
    }

    if (finalDestIndex === -1) finalDestIndex = destList.cards.length;
    destList.cards.splice(finalDestIndex, 0, movedCard);

    setBoard(prev => ({ ...prev, lists: newLists }));

    const cardsToUpdate = [];
    sourceList.cards.forEach((c, i) => {
      const newPos = (i + 1) * 1000;
      if (c.position !== newPos) {
        c.position = newPos;
        cardsToUpdate.push({ id: c.id, list_id: sourceList.id, position: c.position });
      }
    });

    if (sourceList.id !== destList.id) {
      destList.cards.forEach((c, i) => {
        const newPos = (i + 1) * 1000;
        if (c.position !== newPos || c.id === movedCard.id) {
          c.position = newPos;
          cardsToUpdate.push({ id: c.id, list_id: destList.id, position: c.position });
        }
      });
    }

    try {
      await reorderCards(cardsToUpdate);
    } catch (err) {
      console.error('Failed to persist card reorder:', err);
      fetchBoard();
    }
  };

  if (loading || !board) return <div className="loading-screen">Loading premium board...</div>;

  return (
    <div className="main-wrapper" style={{ 
      backgroundColor: board.background_color || 'transparent',
      backgroundImage: board.background_image ? `url(${board.background_image})` : (board.background_color ? 'none' : 'url(/backgrounds/purple.png)'),
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {!user && board.visibility === 'public' && (
        <div className="guest-banner">
          👋 You are viewing this board as a guest. <Link to="/login" style={{color: '#fff', textDecoration: 'underline'}}>Log in</Link> to edit.
        </div>
      )}
      <Navbar onCreateBoard={() => setShowCreate(true)} />

      <div className="board-main-content" style={{ display: 'flex', flex: 1 }}>
        {showInbox && (
          <div className="side-panel">
            <div className="side-panel-header">
              <h2><FiInbox /> Inbox</h2>
              <FiX onClick={() => setShowInbox(false)} cursor="pointer" />
            </div>
            <div className="side-panel-content">
              <div className="inbox-item">
                <div style={{fontWeight: 600}}>See it, send it, save it for later</div>
                <div style={{fontSize: 12, marginTop: 4, color: '#8C9BAB'}}>Inbox helps you stay on top of notifications.</div>
              </div>
            </div>
          </div>
        )}

        {showPlanner && (
          <div className="side-panel planner-panel">
            <div className="side-panel-header">
              <h2><FiCalendar /> Planner</h2>
              <FiX onClick={() => setShowPlanner(false)} cursor="pointer" />
            </div>
            <div className="side-panel-content" style={{textAlign: 'center'}}>
              <h3>Planner</h3>
              <p style={{fontSize: 13, margin: '16px 0', color: '#8C9BAB'}}>Connect your calendars to get a side-by-side view of your Planner and your to-do’s.</p>
              <button className="btn btn-primary" style={{width: '100%'}}>Connect an account</button>
            </div>
          </div>
        )}

        <div className="board-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="board-header">
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 className="board-title">{board.title}</h2>
              <button className={`navbar-btn ${board.is_starred ? 'starred' : ''}`} onClick={toggleStar} style={{fontSize: 18}}>
                <FiStar style={{ fill: board.is_starred ? '#F5CD47' : 'none', color: board.is_starred ? '#F5CD47' : '#fff' }} />
              </button>
              <div 
                className="board-badge" 
                ref={visibilityRef} 
                onClick={() => {
                  if (!isReadOnly) {
                    const rect = visibilityRef.current.getBoundingClientRect();
                    setVisibilityPos({ x: rect.left, y: rect.bottom + 12 });
                    setShowVisibilityPop(!showVisibilityPop);
                  }
                }}
              >
                {board.visibility === 'private' ? <FiLock /> : board.visibility === 'public' ? <FiGlobe /> : <FiUsers />}
                <span style={{textTransform: 'capitalize'}}>{board.visibility || 'workspace'}</span>
              </div>
              <button className="navbar-btn btn-share" onClick={() => setShowShareModal(true)}>
                <FiShare2 /> Share
              </button>
              <div className="board-badge"><FiLayout /> Board</div>
            </div>
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div 
                className="board-badge" 
                ref={backgroundBtnRef}
                onClick={() => {
                  const rect = backgroundBtnRef.current.getBoundingClientRect();
                  setBackgroundPos({ x: rect.left, y: rect.bottom + 12 });
                  setShowBackgroundPop(!showBackgroundPop);
                }}
              >
                <FiGrid /> Background
              </div>
              <button className="navbar-btn"><BsLightningCharge /></button>
              <div style={{ position: 'relative' }}>
                <button ref={filterBtnRef} className={`navbar-btn ${filterText ? 'active-filter' : ''}`} onClick={() => { if (!showFilterPop) { const rect = filterBtnRef.current.getBoundingClientRect(); setFilterPos({ x: rect.left, y: rect.bottom + 8 }); } setShowFilterPop(!showFilterPop); }}>
                  <FiFilter /> Filter
                </button>
                {showFilterPop && (
                  <div ref={filterPopRef} className="visibility-popover filter-popover" onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: filterPos.y, left: filterPos.x, margin: 0, cursor: 'default', zIndex: 5000 }} onMouseDown={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const relativeY = e.clientY - rect.top; if (relativeY < 40) { setIsDragging(true); setDragStart({ x: e.clientX - filterPos.x, y: e.clientY - filterPos.y }); } }}>
                    <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid #444', marginBottom: 12, cursor: 'move', userSelect: 'none', fontWeight: 600 }}>Filter</div>
                    <div style={{ padding: '0 12px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#8C9BAB', marginBottom: 4 }}>Keyword</div>
                      <input className="premium-input" placeholder="Enter a keyword..." value={filterText} onChange={e => setFilterText(e.target.value)} onMouseDown={e => e.stopPropagation()} />
                      {filterText && <button className="btn btn-subtle" onClick={() => setFilterText('')} style={{width: '100%', marginTop: 8}}>Clear filter</button>}
                    </div>
                  </div>
                )}
              </div>
              <button className="navbar-btn"><FiMoreHorizontal /></button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd} isDragDisabled={isReadOnly}>
            <Droppable droppableId="board" direction="horizontal" type="list">
              {(provided) => (
                <div className="board-content" ref={provided.innerRef} {...provided.droppableProps}>
                  {board.lists.map((list, index) => {
                    const filteredCards = list.cards.filter(c => !filterText || c.title.toLowerCase().includes(filterText.toLowerCase()));
                    return (
                      <List key={list.id} list={{ ...list, cards: filteredCards }} index={index} isReadOnly={isReadOnly} onOpenCard={(id) => { setActiveCardId(id); setSearchParams({ card: id }); }} onUpdateList={async (id, data) => { await updateList(id, data); fetchBoard(); }} onDeleteList={async (id) => { await deleteList(id); fetchBoard(); }} />
                    );
                  })}
                  {provided.placeholder}
                  {!isReadOnly && <AddList onAdd={async (title) => { await createList({ board_id: parseInt(id), title }); fetchBoard(); }} />}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <div className="bottom-nav">
        <div className={`bottom-nav-item ${showInbox ? 'active' : ''}`} onClick={() => setShowInbox(!showInbox)}><FiInbox /> Inbox</div>
        <div className="bottom-nav-divider"></div>
        <div className={`bottom-nav-item ${showPlanner ? 'active' : ''}`} onClick={() => setShowPlanner(!showPlanner)}><FiCalendar /> Planner</div>
        <div className="bottom-nav-divider"></div>
        <div className={`bottom-nav-item ${!showInbox && !showPlanner ? 'active' : ''}`} onClick={() => { setShowInbox(false); setShowPlanner(false); }}><FiGrid /> Board</div>
        <div className="bottom-nav-divider"></div>
        <div className="bottom-nav-item" onClick={() => navigate('/')}><FiLayout /> Switch boards</div>
      </div>

      {showShareModal && (
        <ShareModal 
          board={board} 
          onClose={() => setShowShareModal(false)} 
          onVisibilityChange={handleVisibilityChange}
        />
      )}

      {!isReadOnly && showVisibilityPop && (
        <div 
          className="visibility-popover" 
          onClick={e => e.stopPropagation()}
          style={{ 
            position: 'fixed', 
            top: visibilityPos.y, 
            left: visibilityPos.x,
            margin: 0,
            zIndex: 99999 // Ultimate priority
          }}
        >
          <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid #444', marginBottom: 12, fontWeight: 600 }}>Change visibility</div>
          <div className={`visibility-option ${board.visibility === 'workspace' || !board.visibility ? 'active' : ''}`} onClick={() => handleVisibilityChange('workspace')}>
            <FiUsers className="vis-icon" />
            <div className="vis-content"><h4>Workspace</h4><p>All members can see and edit this board.</p></div>
          </div>
          <div className={`visibility-option ${board.visibility === 'private' ? 'active' : ''}`} onClick={() => handleVisibilityChange('private')}>
            <FiLock className="vis-icon" />
            <div className="vis-content"><h4>Private</h4><p>Only board members can see and edit.</p></div>
          </div>
          <div className={`visibility-option ${board.visibility === 'public' ? 'active' : ''}`} onClick={() => handleVisibilityChange('public')}>
            <FiGlobe className="vis-icon" />
            <div className="vis-content"><h4>Public</h4><p>Anyone on the internet can see this board.</p></div>
          </div>
        </div>
      )}

      {showBackgroundPop && (
        <div 
          className="visibility-popover bg-popover" 
          onClick={e => e.stopPropagation()}
          style={{ 
            position: 'fixed', 
            top: backgroundPos.y, 
            left: backgroundPos.x,
            margin: 0,
            zIndex: 99999
          }}
        >
          <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid #444', marginBottom: 12, fontWeight: 600 }}>Change Background</div>
          <div className="bg-grid">
            {backgrounds.map((bg, idx) => (
              <div key={idx} className={`bg-option ${(bg.image === board.background_image || bg.color === board.background_color) ? 'active' : ''}`} style={{ backgroundImage: bg.image ? `url(${bg.image})` : 'none', backgroundColor: bg.color || '#333' }} onClick={() => handleBackgroundChange(bg)}>
                <span>{bg.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeCardId && (

        <CardDetailModal cardId={activeCardId} boardLabels={board.labels || []} boardMembers={allMembers} isReadOnly={isReadOnly} onClose={() => { setActiveCardId(null); setSearchParams({}); }} onUpdate={fetchBoard} />
      )}
      {showToast && (
        <div className="premium-toast manual-toast">
          <span>{toastMsg}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowToast(false)}>OK</button>
        </div>
      )}
      {showCreate && (
        <CreateBoardModal onClose={() => setShowCreate(false)} onCreated={(newBoard) => { setShowCreate(false); navigate(`/board/${newBoard.id}`); }} />
      )}
    </div>
  );
}
