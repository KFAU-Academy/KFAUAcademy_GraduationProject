import express from 'express';
import { createUser, getAllNoteFavorites, getAllVideoFavorites, loginUser, toFavNote, toFavVideo } from '../controllers/userCntrl.js';

const router = express.Router();

router.post("/register", createUser);  //request type will be "post request"
router.post("/login", loginUser);
router.post("/toFavVideo/:vid", toFavVideo);
router.post("/toFavNote/:nid", toFavNote);
router.post("/allVideoFavs", getAllVideoFavorites);
router.post("/allNoteFavs", getAllNoteFavorites);

export {router as userRoute}