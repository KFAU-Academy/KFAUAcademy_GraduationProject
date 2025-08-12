import multer from 'multer';
import path from 'path';

// Dosya türüne göre depolama ayarları
const storage = {
    video: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/videos/'); // Videolar için klasör
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    }),
    note: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/notes/'); // Notlar için klasör
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    }),
};

// Dosya türüne göre filtreleme
const fileFilter = {
    video: (req, file, cb) => {
        const allowedTypes = ['.mp4', '.mov', '.avi', '.mkv'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece MP4, MOV, AVI ve MKV video dosyaları yüklenebilir'), false);
        }
    },
    note: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece PDF, DOC, DOCX ve TXT dosyaları yüklenebilir'), false);
        }
    },
};

// Multer yapılandırmaları
const uploadVideo = multer({
    storage: storage.video,
    fileFilter: fileFilter.video,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const uploadNote = multer({
    storage: storage.note,
    fileFilter: fileFilter.note,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export { uploadVideo, uploadNote };