import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ============ Boards ============
export const getBoards = () => api.get('/boards').then(r => r.data);
export const getBoard = (id) => api.get(`/boards/${id}`).then(r => r.data);
export const createBoard = (data) => api.post('/boards', data).then(r => r.data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data).then(r => r.data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`).then(r => r.data);
export const addBoardMember = (boardId, memberId) => api.post(`/boards/${boardId}/members`, { member_id: memberId }).then(r => r.data);
export const inviteBoardMemberByEmail = (boardId, email) => api.post(`/boards/${boardId}/members/invite`, { email }).then(r => r.data);

// ============ Lists ============
export const createList = (data) => api.post('/lists', data).then(r => r.data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data).then(r => r.data);
export const deleteList = (id) => api.delete(`/lists/${id}`).then(r => r.data);
export const reorderLists = (lists) => api.put('/lists/reorder/batch', { lists }).then(r => r.data);

// ============ Cards ============
export const getCard = (id) => api.get(`/cards/${id}`).then(r => r.data);
export const createCard = (data) => api.post('/cards', data).then(r => r.data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data).then(r => r.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data);
export const reorderCards = (cards) => api.put('/cards/reorder/batch', { cards }).then(r => r.data);
export const searchCards = (params) => api.get('/cards/search/query', { params }).then(r => r.data);

// ============ Card Labels ============
export const addCardLabel = (cardId, labelId) => api.post(`/cards/${cardId}/labels`, { label_id: labelId }).then(r => r.data);
export const removeCardLabel = (cardId, labelId) => api.delete(`/cards/${cardId}/labels/${labelId}`).then(r => r.data);

// ============ Card Members ============
export const addCardMember = (cardId, memberId) => api.post(`/cards/${cardId}/members`, { member_id: memberId }).then(r => r.data);
export const removeCardMember = (cardId, memberId) => api.delete(`/cards/${cardId}/members/${memberId}`).then(r => r.data);

// ============ Checklists ============
export const addChecklist = (cardId, title) => api.post(`/cards/${cardId}/checklists`, { title }).then(r => r.data);
export const deleteChecklist = (cardId, checklistId) => api.delete(`/cards/${cardId}/checklists/${checklistId}`).then(r => r.data);
export const addChecklistItem = (cardId, checklistId, title) => api.post(`/cards/${cardId}/checklists/${checklistId}/items`, { title }).then(r => r.data);
export const updateChecklistItem = (cardId, checklistId, itemId, data) => api.put(`/cards/${cardId}/checklists/${checklistId}/items/${itemId}`, data).then(r => r.data);
export const deleteChecklistItem = (cardId, checklistId, itemId) => api.delete(`/cards/${cardId}/checklists/${checklistId}/items/${itemId}`).then(r => r.data);

// ============ Comments ============
export const addComment = (cardId, text) => api.post(`/cards/${cardId}/comments`, { text }).then(r => r.data);
export const deleteComment = (cardId, commentId) => api.delete(`/cards/${cardId}/comments/${commentId}`).then(r => r.data);

// ============ Members ============
export const getMembers = () => api.get('/members').then(r => r.data);

// ============ Labels ============
export const getBoardLabels = (boardId) => api.get(`/labels/board/${boardId}`).then(r => r.data);
export const createLabel = (data) => api.post('/labels', data).then(r => r.data);
export const updateLabel = (id, data) => api.put(`/labels/${id}`, data).then(r => r.data);
export const deleteLabel = (id) => api.delete(`/labels/${id}`).then(r => r.data);

export default api;
