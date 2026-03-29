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

      <div className="home-container">
        {starredBoards.length > 0 && (
          <div className="home-section">
            <div className="home-section-header"><FiStar /> Starred boards</div>
            <div className="boards-grid">
              {starredBoards.map((board) => (
                <Link
                  to={`/board/${board.id}`}
                  key={board.id}
                  className="board-tile"
                  style={{ 
                    backgroundColor: board.background_color, 
                    backgroundImage: board.background_image 
                      ? (String(board.background_image).includes('gradient') ? board.background_image : `url(${board.background_image})`) 
                      : 'none' 
                  }}
                >
                  <div className="board-tile-overlay" />
                  <span className="board-tile-title">{board.title}</span>
                  <span
                    className={`board-tile-star ${board.is_starred ? 'starred' : ''}`}
                    onClick={(e) => toggleStar(e, board)}
                    style={{position: 'absolute', bottom: 8, right: 8, color: '#F5CD47', zIndex: 3}}
                  >
                    ★
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="home-section">
          <div className="home-section-header"><FiClock /> Recently viewed</div>
          <div className="boards-grid">
            {recentBoards.map((board) => (
              <Link
                to={`/board/${board.id}`}
                key={board.id}
                className="board-tile"
                style={{ 
                  backgroundColor: board.background_color, 
                  backgroundImage: board.background_image 
                    ? (String(board.background_image).includes('gradient') ? board.background_image : `url(${board.background_image})`) 
                    : 'none' 
                }}
              >
                <div className="board-tile-overlay" />
                <span className="board-tile-title">{board.title}</span>
                <span
                  className={`board-tile-star ${board.is_starred ? 'starred' : ''}`}
                  onClick={(e) => toggleStar(e, board)}
                  style={{position: 'absolute', bottom: 8, right: 8, color: board.is_starred ? '#F5CD47' : '#fff', opacity: board.is_starred ? 1 : 0.5, zIndex: 3}}
                >
                  ★
                </span>
              </Link>
            ))}
            <div className="board-tile create-board-tile" onClick={() => setShowCreate(true)}>
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
