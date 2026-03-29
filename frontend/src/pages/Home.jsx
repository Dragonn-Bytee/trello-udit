import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiGrid } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import CreateBoardModal from '../components/CreateBoardModal';
import { getBoards, updateBoard } from '../api';

export default function Home() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoards(); }, []);

  const toggleStar = async (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateBoard(board.id, { is_starred: !board.is_starred });
      setBoards((prev) =>
        prev.map((b) => (b.id === board.id ? { ...b, is_starred: !b.is_starred } : b))
      );
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const starredBoards = boards.filter((b) => b.is_starred);
  const recentBoards = boards;

  return (
    <div className="main-wrapper" style={{ background: '#1D2125' }}>
      <Navbar onCreateBoard={() => setShowCreate(true)} />

      <div className="home-content" style={{width: '100%', maxWidth: 1200, margin: '0 auto', padding: '40px 16px', overflowY: 'auto'}}>
        {starredBoards.length > 0 && (
          <div className="home-section">
            <div className="home-section-header" style={{color: '#B6C2CF', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontSize: 16, fontWeight: 700}}>
              <FiStar /> Starred boards
            </div>
            <div className="boards-grid" style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
              {starredBoards.map((board) => (
                <Link
                  to={`/board/${board.id}`}
                  key={board.id}
                  className="board-tile"
                  style={{ background: board.background_color, width: 200, height: 96, borderRadius: 3, padding: 12, color: '#fff', fontWeight: 700, textDecoration: 'none', position: 'relative' }}
                >
                  <span className="board-tile-title">{board.title}</span>
                  <span
                    className={`board-tile-star ${board.is_starred ? 'starred' : ''}`}
                    onClick={(e) => toggleStar(e, board)}
                    style={{position: 'absolute', bottom: 8, right: 8, color: '#F5CD47'}}
                  >
                    ★
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="home-section" style={{marginTop: 40}}>
          <div className="home-section-header" style={{color: '#B6C2CF', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontSize: 16, fontWeight: 700}}>
            <FiClock /> Recently viewed
          </div>
          <div className="boards-grid" style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
            {recentBoards.map((board) => (
              <Link
                to={`/board/${board.id}`}
                key={board.id}
                className="board-tile"
                style={{ background: board.background_color, width: 200, height: 96, borderRadius: 3, padding: 12, color: '#fff', fontWeight: 700, textDecoration: 'none', position: 'relative' }}
              >
                <span className="board-tile-title">{board.title}</span>
                <span
                  className={`board-tile-star ${board.is_starred ? 'starred' : ''}`}
                  onClick={(e) => toggleStar(e, board)}
                  style={{position: 'absolute', bottom: 8, right: 8, color: board.is_starred ? '#F5CD47' : '#fff', opacity: board.is_starred ? 1 : 0.5}}
                >
                  ★
                </span>
              </Link>
            ))}
            <div
              className="board-tile create-board-tile"
              onClick={() => setShowCreate(true)}
              style={{ background: 'rgba(255,255,255,0.05)', width: 200, height: 96, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B6C2CF', cursor: 'pointer' }}
            >
              Create new board
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateBoardModal
          onClose={() => setShowCreate(false)}
          onCreated={(board) => {
            setBoards((prev) => [board, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
