import asyncHandler from 'express-async-handler';
import { prisma } from '../config/prismaConfig.js';
import { ObjectId } from 'mongodb';

export const createVideo = asyncHandler(async (req, res) => {
  const { courseName, videoTitle, userEmail } = req.body;
  const image = req.body.image || "video_icon.png";

  if (!req.file) {
    res.status(400).json({ message: 'Lütfen bir video dosyası yükleyin' });
    return;
  }

  if (!courseName || !videoTitle || !userEmail) {
    res.status(400).json({ message: 'courseName, videoTitle ve userEmail alanları zorunludur' });
    return;
  }

  const videoUrl = '/Uploads/videos/' + req.file.filename;

  try {
    const userExists = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!userExists) {
      res.status(400).json({ message: `User with email ${userEmail} not found` });
      return;
    }

    const video = await prisma.video.create({
      data: {
        courseName,
        videoTitle,
        videoUrl,
        image,
        owner: { connect: { email: userEmail } },
      },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.status(201).json({ message: 'Video başarıyla oluşturuldu', video });
  } catch (err) {
    console.error("Create video error:", {
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
    if (err.code === 'P2002') {
      res.status(400).json({ message: 'Bu video zaten mevcut (videoUrl benzersiz olmalı)' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(400).json({ message: `Invalid user email: ${userEmail}` });
      return;
    }
    res.status(500).json({ message: `Video oluşturulamadı: ${err.message}` });
  }
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseName, videoTitle, userEmail } = req.body;
  const image = req.body.image || "video_icon.png";
  let videoUrl = null;

  if (!courseName || !videoTitle || !userEmail) {
    res.status(400).json({ message: 'courseName, videoTitle ve userEmail alanları zorunludur' });
    return;
  }

  if (req.file) {
    videoUrl = '/Uploads/videos/' + req.file.filename;
  }

  try {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: `Invalid video ID: ${id}` });
      return;
    }

    const video = await prisma.video.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    if (video.userEmail !== userEmail) {
      res.status(403).json({ message: "You are not authorized to update this video" });
      return;
    }

    const updateData = {
      courseName,
      videoTitle,
      image,
    };

    if (videoUrl) {
      updateData.videoUrl = videoUrl;
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.json({ message: 'Video başarıyla güncellendi', video: updatedVideo });
  } catch (err) {
    console.error("Update video error:", err);
    if (err.code === 'P2002') {
      res.status(400).json({ message: 'Bu video zaten mevcut (videoUrl benzersiz olmalı)' });
      return;
    }
    res.status(500).json({ message: `Failed to update video: ${err.message}` });
  }
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    res.status(400).json({ message: "User email is required" });
    return;
  }

  try {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: `Invalid video ID: ${id}` });
      return;
    }

    const video = await prisma.video.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    if (video.userEmail !== userEmail) {
      res.status(403).json({ message: "You are not authorized to delete this video" });
      return;
    }

    await prisma.video.delete({
      where: { id },
    });
    res.json({ message: 'Video başarıyla silindi' });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ message: `Failed to delete video: ${err.message}` });
  }
});

export const getAllVideos = asyncHandler(async (req, res)=>{
    const videos = await prisma.video.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
    res.send(videos)
});

export const getMyVideos = asyncHandler(async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    res.status(400).json({ message: "User email is required" });
    return;
  }

  try {
    const videos = await prisma.video.findMany({
      where: { userEmail },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.json(videos);
  } catch (err) {
    console.error("Get my videos error:", err);
    res.status(500).json({ message: `Failed to fetch your videos: ${err.message}` });
  }
});

export const getVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: `Invalid video ID: ${id}` });
      return;
    }

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });

    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    res.json(video);
  } catch (err) {
    console.error("Get video error:", err);
    if (err.code === 'P2023') {
      res.status(400).json({ message: `Invalid video ID: ${id}` });
      return;
    }
    res.status(500).json({ message: `Failed to fetch video: ${err.message}` });
  }
});