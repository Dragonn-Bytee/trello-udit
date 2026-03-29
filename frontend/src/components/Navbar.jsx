import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiHelpCircle, FiChevronDown, FiGrid, FiLogOut, FiUser, FiX } from 'react-icons/fi';
import { BsTrello } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onCreateBoard, filterText = '', onFilterChange }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSearchChange = (e) => {
    if (onFilterChange) {
      onFilterChange(e.target.value);
    }
  };

  const handleClearFilter = () => {
    if (onFilterChange) {
      onFilterChange('');
    }
    if (searchRef.current) {
      searchRef.current.querySelector('input')?.focus();
    }
  };

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

      <div className={`navbar-search ${filterText ? 'search-active' : ''}`} ref={searchRef}>
        <FiSearch className="navbar-search-icon" />
        <input
          type="text"
          placeholder="Filter cards..."
          value={filterText}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {filterText && (
          <button 
            className="search-clear-btn"
            onClick={handleClearFilter}
            title="Clear filter"
          >
            <FiX />
          </button>
        )}
        {filterText && !searchFocused && (
          <span className="filter-active-badge">Filtering</span>
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
