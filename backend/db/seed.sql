-- ============================================
-- Seed Data for Trello Clone
-- ============================================

-- Sample Members
INSERT INTO members (username, full_name, email, avatar_color, initials) VALUES
('johndoe', 'John Doe', 'john@example.com', '#0079BF', 'JD'),
('janesmith', 'Jane Smith', 'jane@example.com', '#D29034', 'JS'),
('bobwilson', 'Bob Wilson', 'bob@example.com', '#519839', 'BW'),
('alicejohnson', 'Alice Johnson', 'alice@example.com', '#B04632', 'AJ'),
('charlielee', 'Charlie Lee', 'charlie@example.com', '#89609E', 'CL')
ON CONFLICT (username) DO NOTHING;

-- Sample Board
INSERT INTO boards (id, title, background_color, is_starred, created_by) VALUES
(1, 'Project Alpha', '#0079BF', true, 1),
(2, 'Marketing Campaign', '#519839', false, 2),
(3, 'Bug Tracker', '#B04632', false, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('boards_id_seq', 3);

-- Board Members
INSERT INTO board_members (board_id, member_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2),
(3, 1), (3, 3), (3, 4)
ON CONFLICT DO NOTHING;

-- Labels for Board 1
INSERT INTO labels (id, board_id, name, color) VALUES
(1, 1, 'Urgent', '#EB5A46'),
(2, 1, 'Feature', '#61BD4F'),
(3, 1, 'Bug', '#F2D600'),
(4, 1, 'Enhancement', '#0079BF'),
(5, 1, 'Documentation', '#C377E0'),
(6, 1, 'Design', '#FF9F1A')
ON CONFLICT (id) DO NOTHING;

SELECT setval('labels_id_seq', 6);

-- Lists for Board 1
INSERT INTO lists (id, board_id, title, position) VALUES
(1, 1, 'Backlog', 1000),
(2, 1, 'To Do', 2000),
(3, 1, 'In Progress', 3000),
(4, 1, 'Review', 4000),
(5, 1, 'Done', 5000)
ON CONFLICT (id) DO NOTHING;

SELECT setval('lists_id_seq', 5);

-- Cards for List 1 (Backlog)
INSERT INTO cards (id, list_id, title, description, position) VALUES
(1, 1, 'Research competitor features', 'Analyze top 5 competitors and list their key features for our roadmap.', 1000),
(2, 1, 'Define API endpoints', 'Document all REST API endpoints with request/response schemas.', 2000),
(3, 1, 'Create wireframes for mobile app', NULL, 3000)
ON CONFLICT (id) DO NOTHING;

-- Cards for List 2 (To Do)
INSERT INTO cards (id, list_id, title, description, position, due_date) VALUES
(4, 2, 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment.', 1000, '2026-04-05'),
(5, 2, 'Design database schema', 'Create ER diagram and define all table relationships.', 2000, '2026-04-03'),
(6, 2, 'Write unit tests for auth module', 'Achieve 80% test coverage for authentication.', 3000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Cards for List 3 (In Progress)
INSERT INTO cards (id, list_id, title, description, position, due_date, cover_color) VALUES
(7, 3, 'Implement user dashboard', 'Build the main dashboard with analytics widgets and recent activity.', 1000, '2026-04-01', '#0079BF'),
(8, 3, 'Integrate payment gateway', 'Add Stripe integration for premium subscriptions.', 2000, '2026-04-02', NULL),
(9, 3, 'Setup monitoring and alerts', 'Configure Datadog for application monitoring.', 3000, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Cards for List 4 (Review)
INSERT INTO cards (id, list_id, title, description, position, due_date) VALUES
(10, 4, 'Landing page redesign', 'New landing page with updated branding and improved CTA.', 1000, '2026-03-30'),
(11, 4, 'API documentation', 'Swagger/OpenAPI documentation for all endpoints.', 2000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Cards for List 5 (Done)
INSERT INTO cards (id, list_id, title, description, position, due_date, due_complete) VALUES
(12, 5, 'Setup development environment', 'Configure Docker, ESLint, Prettier, and development scripts.', 1000, '2026-03-25', true),
(13, 5, 'Project kickoff meeting', 'Align team on Q2 goals and sprint planning.', 2000, '2026-03-20', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('cards_id_seq', 13);

-- Card Labels
INSERT INTO card_labels (card_id, label_id) VALUES
(1, 4), (1, 5),
(4, 1), (4, 4),
(5, 2),
(7, 2), (7, 4),
(8, 1), (8, 2),
(10, 6),
(11, 5)
ON CONFLICT DO NOTHING;

-- Card Members
INSERT INTO card_members (card_id, member_id) VALUES
(4, 1), (4, 3),
(5, 2),
(7, 1), (7, 2),
(8, 3), (8, 4),
(9, 5),
(10, 2), (10, 4),
(12, 1)
ON CONFLICT DO NOTHING;

-- Checklists
INSERT INTO checklists (id, card_id, title, position) VALUES
(1, 4, 'CI/CD Steps', 1000),
(2, 7, 'Dashboard Components', 1000),
(3, 8, 'Payment Integration Steps', 1000)
ON CONFLICT (id) DO NOTHING;

SELECT setval('checklists_id_seq', 3);

-- Checklist Items
INSERT INTO checklist_items (id, checklist_id, title, is_checked, position) VALUES
(1, 1, 'Setup GitHub Actions workflow', true, 1000),
(2, 1, 'Configure test runners', true, 2000),
(3, 1, 'Add deployment step', false, 3000),
(4, 1, 'Setup environment secrets', false, 4000),
(5, 2, 'Analytics overview widget', true, 1000),
(6, 2, 'Recent activity feed', false, 2000),
(7, 2, 'Quick actions panel', false, 3000),
(8, 2, 'Team members sidebar', false, 4000),
(9, 3, 'Create Stripe account', true, 1000),
(10, 3, 'Implement checkout flow', false, 2000),
(11, 3, 'Add webhook handlers', false, 3000),
(12, 3, 'Test with sandbox', false, 4000)
ON CONFLICT (id) DO NOTHING;

SELECT setval('checklist_items_id_seq', 12);

-- Sample Comments
INSERT INTO comments (id, card_id, member_id, text) VALUES
(1, 7, 2, 'I''ve started working on the analytics widgets. Should we use Chart.js or D3?'),
(2, 7, 1, 'Let''s go with Chart.js for simplicity. We can migrate later if needed.'),
(3, 8, 3, 'Stripe API keys have been added to the vault.'),
(4, 10, 4, 'The new mockups are ready for review in Figma.'),
(5, 4, 1, 'Let''s make sure we include staging deployment as well.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('comments_id_seq', 5);

-- Sample Activity Log
INSERT INTO activity_log (board_id, card_id, member_id, action_type, description) VALUES
(1, 12, 1, 'card_complete', 'John Doe marked "Setup development environment" as complete'),
(1, 13, 1, 'card_complete', 'John Doe marked "Project kickoff meeting" as complete'),
(1, 7, 1, 'card_move', 'John Doe moved "Implement user dashboard" to In Progress'),
(1, 8, 3, 'card_move', 'Bob Wilson moved "Integrate payment gateway" to In Progress'),
(1, 10, 2, 'card_move', 'Jane Smith moved "Landing page redesign" to Review');
