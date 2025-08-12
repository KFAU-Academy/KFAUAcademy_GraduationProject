import express from 'express';
import { createVideo, deleteVideo, getAllVideos, getMyVideos, getVideo, updateVideo } from '../controllers/videoCntrl.js';
import { uploadVideo } from '../config/multerConfig.js';

const router = express.Router();

// Spesifik route'lar önce
router.get('/myvideos', getMyVideos);
router.get('/allvideos', getAllVideos);

// Dinamik route'lar sonra
router.post('/create', uploadVideo.single('file'), createVideo);
router.put('/:id', uploadVideo.single('file'), updateVideo);
router.get('/:id', getVideo);
router.delete('/:id', deleteVideo);

export { router as videoRoute };