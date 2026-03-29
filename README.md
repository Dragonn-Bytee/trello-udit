# 📋 Trello Clone - Modern Kanban Solution

A professional, feature-rich Kanban-style project management application designed to organize tasks, streamline workflows, and enhance team collaboration. Built with a robust full-stack architecture focusing on real-time interactions and premium aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Language:** JavaScript / TypeScript Support
- **State Management:** React Hooks (useState, useEffect, useMemo)
- **Drag & Drop:** `@hello-pangea/dnd`
- **Styling:** Vanilla CSS3 with Glassmorphism & Modern UI/UX patterns
- **Icons:** `react-icons` (Fi, Bs)

### Backend
- **Core:** Node.js, Express 5
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Database:** PostgreSQL (with `pg` driver) / SQLite Support
- **Media Handling:** Multer (for file uploads)
- **Utilities:** `uuid`, `dotenv`, `cors`

---

## ✨ Features

- **Real-Time Board Filter:** Instant card search with text highlighting and empty state detection.
- **Advanced Drag & Drop:** Seamless movement for both cards between lists and lists within a board.
- **Premium UI/UX:** Stunning glassmorphism design, custom backgrounds (solid, gradients, images), and responsive layouts.
- **Collaboration Tools:** Board visibility controls (Public, Workspace, Private) and user invitation systems.
- **Comprehensive Card Details:** Labels, due dates, checklists, comments, and attachments.
- **Dynamic Portals:** Modal systems & dropdowns that break out of stacking contexts for zero layering issues.

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Dragonn-Bytee/trello-udit.git
cd trello
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/trello_clone
JWT_SECRET=your_super_secret_key
PORT=5000
```
Start the server:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Start the development server:
```bash
npm run dev
```

### 4. Open in Browser
Visit `http://localhost:5173` to start managing your projects!

---

## 📖 Usage Instructions

1. **Create an Account:** Sign up or log in to get started.
2. **Setup Boards:** Create a new board and choose a premium background.
3. **Manage Lists:** Add columns like "To Do", "In Progress", and "Done".
4. **Organize Cards:** Add cards, set labels, add checklists, and drag them between lists.
5. **Real-time Filter:** Use the search bar in the navbar to instantly filter cards on your board by title.

---

## 📁 Folder Structure

```text
trello/
├── frontend/           # React frontend source code
│   ├── src/
│   │   ├── components/ # Reusable UI components (Navbar, List, Card)
│   │   ├── pages/      # Main views (Board, Dashboard, Auth)
│   │   └── api/        # Axios API client configurations
│   └── public/         # Static assets and backgrounds
├── backend/            # Express backend & API
│   ├── db/             # Database connection & schema scripts
│   ├── routes/         # Express API route handlers
│   └── middleware/     # Auth and file processing logic
└── .env                # (To be created) Configuration file
```

---

## 🧪 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for token generation | - |
| `PORT` | Backend server port | `5000` |

---

## 📸 Screenshots

> [!TIP]
> *Add your platform screenshots here to showcase the stunning UI!*

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 📬 Contact
**GitHub:** [Dragonn-Bytee](https://github.com/Dragonn-Bytee)
