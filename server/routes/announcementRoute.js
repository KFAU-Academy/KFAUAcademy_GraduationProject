import express from 'express';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, getAnnouncement, getMyAnnouncements, updateAnnouncement} from '../controllers/announcementCntrl.js';
const router = express.Router();

router.post("/create", createAnnouncement)
router.delete("/:id", deleteAnnouncement);
router.put("/:id", updateAnnouncement);
router.get("/allann", getAllAnnouncements)
router.get("/myann", getMyAnnouncements)
router.get("/:id", getAnnouncement)

export {router as announcementRoute}