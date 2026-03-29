import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiBell, FiHelpCircle, FiChevronDown, FiGrid, FiLogOut, FiUser } from 'react-icons/fi';
import { BsTrello } from 'react-icons/bs';
import { searchCards } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onCreateBoard }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchCards({ q });
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, doSearch]);

  // Handle outside clicks for user menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <FiGrid title="More apps" cursor="pointer" style={{fontSize: 20, marginRight: 8}} />
          <BsTrello />
          <span>Trello</span>
        </Link>
        <div className="navbar-btn">Workspaces <FiChevronDown /></div>
        <div className="navbar-btn">Recent <FiChevronDown /></div>
        <div className="navbar-btn">Starred <FiChevronDown /></div>
        <button className="navbar-btn navbar-btn-create" onClick={onCreateBoard}>
          Create
        </button>
      </div>

      <div className="navbar-search" ref={searchRef}>
        <FiSearch className="navbar-search-icon" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && results.length > 0 && (
          <div className="search-results-dropdown">
            {results.map(card => (
              <div 
                key={card.id} 
                className="search-result-item"
                onClick={() => {
                  setSearchTerm('');
                  navigate(`/board/${card.board_id}?card=${card.id}`);
                }}
              >
                <div style={{fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{card.title}</div>
                <div style={{fontSize: 12, color: '#8C9BAB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>in {card.list_title} • {card.board_title}</div>
              </div>
            ))}
          </div>
        )}
        {searchTerm && results.length === 0 && !loading && (
          <div className="search-results-dropdown">
            <div style={{padding: 12, color: '#8C9BAB', textAlign: 'center'}}>No cards found</div>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <button className="navbar-btn" style={{fontSize: 20}}><FiBell /></button>
        <button className="navbar-btn" style={{fontSize: 20}}><FiHelpCircle /></button>
        
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div 
            className="member-avatar" 
            style={{ background: user?.avatar_color || '#5E4DB2', marginLeft: 8, cursor: 'pointer' }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.initials || '??'}
          </div>

          {showUserMenu && (
            <div className="visibility-popover" style={{ top: 40, right: 0, left: 'auto', width: 280 }}>
              <div style={{ padding: '8px 4px', borderBottom: '1px solid #444', marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#8C9BAB', marginBottom: 4 }}>ACCOUNT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="member-avatar" style={{ background: user?.avatar_color, flexShrink: 0 }}>{user?.initials}</div>
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</div>
                    <div style={{ fontSize: 12, color: '#8C9BAB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="visibility-option">
                <FiUser className="vis-icon" />
                <div className="vis-content"><h4>Profile and Visibility</h4></div>
              </div>
              <div className="visibility-option" onClick={() => { logout(); navigate('/login'); }}>
                <FiLogOut className="vis-icon" />
                <div className="vis-content"><h4>Log out</h4></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
