-- ============================================
-- Trello Clone Database Schema
-- ============================================

-- Members table (no auth, assume default user)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    avatar_color VARCHAR(7) DEFAULT '#0079BF',
    initials VARCHAR(3),
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    background_color VARCHAR(50) DEFAULT '#0079BF',
    background_image TEXT,
    visibility VARCHAR(20) DEFAULT 'workspace',
    is_starred BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Board members (many-to-many)
CREATE TABLE IF NOT EXISTS board_members (
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    PRIMARY KEY (board_id, member_id)
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    position FLOAT NOT NULL DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100),
    color VARCHAR(50) NOT NULL
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    position FLOAT NOT NULL DEFAULT 0,
    due_date TIMESTAMP,
    due_complete BOOLEAN DEFAULT FALSE,
    cover_color VARCHAR(50),
    cover_image TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Card labels (many-to-many)
CREATE TABLE IF NOT EXISTS card_labels (
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, label_id)
);

-- Card members (many-to-many)
CREATE TABLE IF NOT EXISTS card_members (
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, member_id)
);

-- Checklists table
CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Checklist',
    position FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(500) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    position FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_title ON cards(title);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_activity_board_id ON activity_log(board_id);
CREATE INDEX IF NOT EXISTS idx_checklists_card_id ON checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
