const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a connection pool using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper: run a query (returns { rows, rowCount })
const query = (text, params) => pool.query(text, params);

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Read and execute the schema SQL
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSQL);
    await client.query('ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
    await client.query('ALTER TABLE members ADD COLUMN IF NOT EXISTS bio TEXT');
    console.log('✅ Database schema initialized');

    // Check if data exists
    const result = await client.query('SELECT COUNT(*) as count FROM members');
    if (parseInt(result.rows[0].count) === 0) {
      await seedDatabase(client);
      console.log('✅ Seed data inserted');
    } else {
      console.log('ℹ️  Database already seeded');
    }
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function seedDatabase(client) {
  await client.query('BEGIN');
  try {
    // Members (password is 'password123')
    const passHash = '$2a$10$m63i.U.S586mP2XfR0hNeeQ8jN.H9X5L6J8F4ZfS7.Fv08y1z5.G';
    await client.query(`
      INSERT INTO members (username, full_name, email, password_hash, avatar_color, initials) VALUES
        ('johndoe', 'John Doe', 'john@example.com', '${passHash}', '#0079BF', 'JD'),
        ('janesmith', 'Jane Smith', 'jane@example.com', '${passHash}', '#D29034', 'JS'),
        ('bobwilson', 'Bob Wilson', 'bob@example.com', '${passHash}', '#519839', 'BW'),
        ('alicejohnson', 'Alice Johnson', 'alice@example.com', '${passHash}', '#B04632', 'AJ'),
        ('charlielee', 'Charlie Lee', 'charlie@example.com', '${passHash}', '#89609E', 'CL')
    `);

    // Boards
    await client.query(`
      INSERT INTO boards (title, background_color, is_starred, created_by) VALUES
        ('Project Alpha', '#0079BF', TRUE, 1),
        ('Marketing Campaign', '#519839', FALSE, 2),
        ('Bug Tracker', '#B04632', FALSE, 1)
    `);

    // Board members
    const boardMembers = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,1],[2,2],[3,1],[3,3],[3,4]];
    for (const [b, m] of boardMembers) {
      await client.query('INSERT INTO board_members (board_id, member_id) VALUES ($1, $2)', [b, m]);
    }

    // Labels for Board 1
    await client.query(`
      INSERT INTO labels (board_id, name, color) VALUES
        (1, 'Urgent', '#EB5A46'),
        (1, 'Feature', '#61BD4F'),
        (1, 'Bug', '#F2D600'),
        (1, 'Enhancement', '#0079BF'),
        (1, 'Documentation', '#C377E0'),
        (1, 'Design', '#FF9F1A')
    `);

    // Lists for Board 1
    await client.query(`
      INSERT INTO lists (board_id, title, position) VALUES
        (1, 'Backlog', 1000),
        (1, 'To Do', 2000),
        (1, 'In Progress', 3000),
        (1, 'Review', 4000),
        (1, 'Done', 5000)
    `);

    // Cards for Backlog (list 1)
    await client.query(`
      INSERT INTO cards (list_id, title, description, position, due_date, due_complete, cover_color) VALUES
        (1, 'Research competitor features', 'Analyze top 5 competitors and list their key features for our roadmap.', 1000, NULL, FALSE, NULL),
        (1, 'Define API endpoints', 'Document all REST API endpoints with request/response schemas.', 2000, NULL, FALSE, NULL),
        (1, 'Create wireframes for mobile app', NULL, 3000, NULL, FALSE, NULL)
    `);

    // Cards for To Do (list 2)
    await client.query(`
      INSERT INTO cards (list_id, title, description, position, due_date, due_complete, cover_color) VALUES
        (2, 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment.', 1000, '2026-04-05', FALSE, NULL),
        (2, 'Design database schema', 'Create ER diagram and define all table relationships.', 2000, '2026-04-03', FALSE, NULL),
        (2, 'Write unit tests for auth module', 'Achieve 80% test coverage for authentication.', 3000, NULL, FALSE, NULL)
    `);

    // Cards for In Progress (list 3)
    await client.query(`
      INSERT INTO cards (list_id, title, description, position, due_date, due_complete, cover_color) VALUES
        (3, 'Implement user dashboard', 'Build the main dashboard with analytics widgets and recent activity.', 1000, '2026-04-01', FALSE, '#0079BF'),
        (3, 'Integrate payment gateway', 'Add Stripe integration for premium subscriptions.', 2000, '2026-04-02', FALSE, NULL),
        (3, 'Setup monitoring and alerts', 'Configure Datadog for application monitoring.', 3000, NULL, FALSE, NULL)
    `);

    // Cards for Review (list 4)
    await client.query(`
      INSERT INTO cards (list_id, title, description, position, due_date, due_complete, cover_color) VALUES
        (4, 'Landing page redesign', 'New landing page with updated branding and improved CTA.', 1000, '2026-03-30', FALSE, NULL),
        (4, 'API documentation', 'Swagger/OpenAPI documentation for all endpoints.', 2000, NULL, FALSE, NULL)
    `);

    // Cards for Done (list 5)
    await client.query(`
      INSERT INTO cards (list_id, title, description, position, due_date, due_complete, cover_color) VALUES
        (5, 'Setup development environment', 'Configure Docker, ESLint, Prettier, and development scripts.', 1000, '2026-03-25', TRUE, NULL),
        (5, 'Project kickoff meeting', 'Align team on Q2 goals and sprint planning.', 2000, '2026-03-20', TRUE, NULL)
    `);

    // Card Labels
    const cardLabels = [[1,4],[1,5],[4,1],[4,4],[5,2],[7,2],[7,4],[8,1],[8,2],[10,6],[11,5]];
    for (const [c, l] of cardLabels) {
      await client.query('INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2)', [c, l]);
    }

    // Card Members
    const cardMembers = [[4,1],[4,3],[5,2],[7,1],[7,2],[8,3],[8,4],[9,5],[10,2],[10,4],[12,1]];
    for (const [c, m] of cardMembers) {
      await client.query('INSERT INTO card_members (card_id, member_id) VALUES ($1, $2)', [c, m]);
    }

    // Checklists
    await client.query(`
      INSERT INTO checklists (card_id, title, position) VALUES
        (4, 'CI/CD Steps', 1000),
        (7, 'Dashboard Components', 1000),
        (8, 'Payment Integration Steps', 1000)
    `);

    // Checklist Items
    await client.query(`
      INSERT INTO checklist_items (checklist_id, title, is_checked, position) VALUES
        (1, 'Setup GitHub Actions workflow', TRUE, 1000),
        (1, 'Configure test runners', TRUE, 2000),
        (1, 'Add deployment step', FALSE, 3000),
        (1, 'Setup environment secrets', FALSE, 4000),
        (2, 'Analytics overview widget', TRUE, 1000),
        (2, 'Recent activity feed', FALSE, 2000),
        (2, 'Quick actions panel', FALSE, 3000),
        (2, 'Team members sidebar', FALSE, 4000),
        (3, 'Create Stripe account', TRUE, 1000),
        (3, 'Implement checkout flow', FALSE, 2000),
        (3, 'Add webhook handlers', FALSE, 3000),
        (3, 'Test with sandbox', FALSE, 4000)
    `);

    // Comments
    await client.query(`
      INSERT INTO comments (card_id, member_id, text) VALUES
        (7, 2, 'I''ve started working on the analytics widgets. Should we use Chart.js or D3?'),
        (7, 1, 'Let''s go with Chart.js for simplicity. We can migrate later if needed.'),
        (8, 3, 'Stripe API keys have been added to the vault.'),
        (10, 4, 'The new mockups are ready for review in Figma.'),
        (4, 1, 'Let''s make sure we include staging deployment as well.')
    `);

    // Activity
    await client.query(`
      INSERT INTO activity_log (board_id, card_id, member_id, action_type, description) VALUES
        (1, 12, 1, 'card_complete', 'John Doe marked "Setup development environment" as complete'),
        (1, 13, 1, 'card_complete', 'John Doe marked "Project kickoff meeting" as complete'),
        (1, 7, 1, 'card_move', 'John Doe moved "Implement user dashboard" to In Progress'),
        (1, 8, 3, 'card_move', 'Bob Wilson moved "Integrate payment gateway" to In Progress'),
        (1, 10, 2, 'card_move', 'Jane Smith moved "Landing page redesign" to Review')
    `);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

module.exports = { pool, query, initializeDatabase };
