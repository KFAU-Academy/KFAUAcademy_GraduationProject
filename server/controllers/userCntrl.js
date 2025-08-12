import asyncHandler from 'express-async-handler';
import {prisma} from "../config/prismaConfig.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


//basic format of making an API:
export const createUser = asyncHandler(async(req, res)=>{
    console.log("Creating a user");

    let {email} = req.body;
    let {password} = req.body;
    let {fullName} = req.body;

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) return res.status(409).send({ message: "User already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName,
        }
    });

    res.send({ message: "User registered successfully", user });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
        // JWT token oluştur
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET, // ENV dosyasında tanımlanmalı
            { expiresIn: "7d" } // token 7 gün geçerli
        );

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            token,
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
});

//function to add a video in favorite list of a user
export const toFavVideo = asyncHandler(async (req,res)=>{
    const {email} = req.body;
    const {vid} = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })
        if(user.favVideosID.includes(vid)){
            const updateUser = await prisma.user.update({
                where: {email},
                data: {
                    favVideosID:{
                        set: user.favVideosID.filter((id)=>id !== vid)
                    }
                }
            });

            res.send({message: "Removed from favorites", user: updateUser});
        } else{
            const updateUser = await prisma.user.update({
                where: {email},
                data:{
                    favVideosID:{
                        push: vid
                    }
                }
            });

            res.send({message: "Updated favorites", user: updateUser});
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

//function to add a note in favorite list of a user
export const toFavNote = asyncHandler(async (req,res)=>{
    const {email} = req.body;
    const {nid} = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })
        if(user.favNotesID.includes(nid)){
            const updateUser = await prisma.user.update({
                where: {email},
                data: {
                    favNotesID:{
                        set: user.favNotesID.filter((id)=>id !== nid)
                    }
                }
            });

            res.send({message: "Removed from favorites", user: updateUser});
        } else{
            const updateUser = await prisma.user.update({
                where: {email},
                data:{
                    favNotesID:{
                        push: nid
                    }
                }
            });

            res.send({message: "Updated favorites", user: updateUser});
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

//function to get all favorite videos
export const getAllVideoFavorites = asyncHandler(async (req,res)=>{
    const {email} = req.body;
    try {
        const favVideos = await prisma.user.findUnique({
            where:{email},
            select: {favVideosID: true}
        })
        res.status(200).send(favVideos);
    } catch (error) {
        throw new Error(error.message);
    }
});

//function to get all favorite notes
export const getAllNoteFavorites = asyncHandler(async (req,res)=>{
    const {email} = req.body;
    try {
        const favNotes = await prisma.user.findUnique({
            where:{email},
            select: {favNotesID: true}
        })
        res.status(200).send(favNotes);
    } catch (error) {
        throw new Error(error.message);
    }});