import express from 'express';
import { createNote, deleteNote, getAllNotes, getMyNotes, getNote, updateNote } from '../controllers/noteCntrl.js';
import { uploadNote } from '../config/multerConfig.js'; // uploadNote import ediliyor

const router = express.Router();

// Spesifik route'lar önce
router.get('/mynotes', getMyNotes);
router.get('/allnotes', getAllNotes);

// Dinamik route'lar sonra
router.post('/create', uploadNote.single('file'), createNote);
router.put('/:id', uploadNote.single('file'), updateNote);
router.get('/:id', getNote);
router.delete('/:id', deleteNote); 

export { router as noteRoute };