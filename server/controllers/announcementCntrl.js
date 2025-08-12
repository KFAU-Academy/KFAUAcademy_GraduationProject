import asyncHandler from 'express-async-handler';
import { prisma } from '../config/prismaConfig.js';

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { category, title, content, userEmail } = req.body;

  if (!category || !title || !content || !userEmail) {
    res.status(400).send({ message: "All fields (category, title, content, userEmail) are required" });
    return;
  }

  try {
    // userEmail'in User tablosunda var olduğunu kontrol et
    const userExists = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!userExists) {
      console.error(`User not found for email: ${userEmail}`);
      res.status(400).send({ message: `User with email ${userEmail} not found` });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        category,
        title,
        content,
        owner: { connect: { email: userEmail } }, // userEmail'i yalnızca owner için kullanıyoruz
      },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.send({ message: "Announcement created successfully", announcement });
  } catch (err) {
    console.error("Create announcement error:", {
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
    if (err.code === "P2002") {
      res.status(400).send({ message: "An announcement with this title already exists" });
      return;
    }
    if (err.code === "P2025") {
      res.status(400).send({ message: `Invalid user email: ${userEmail}` });
      return;
    }
    if (err.name === "PrismaClientValidationError") {
      res.status(400).send({ message: `Invalid data provided: ${err.message}` });
      return;
    }
    res.status(500).send({ message: `Failed to create announcement: ${err.message}` });
  }
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    res.status(400).send({ message: "User email is required" });
    return;
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!announcement) {
      res.status(404).send({ message: "Announcement not found" });
      return;
    }

    if (announcement.userEmail !== userEmail) {
      res.status(403).send({ message: "You are not authorized to delete this announcement" });
      return;
    }

    await prisma.announcement.delete({
      where: { id },
    });
    res.send({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Delete announcement error:", err);
    res.status(500).send({ message: `Failed to delete announcement: ${err.message}` });
  }
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, title, content, userEmail } = req.body;

  if (!category || !title || !content || !userEmail) {
    res.status(400).send({ message: "All fields (category, title, content, userEmail) are required" });
    return;
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!announcement) {
      res.status(404).send({ message: "Announcement not found" });
      return;
    }

    if (announcement.userEmail !== userEmail) {
      res.status(403).send({ message: "You are not authorized to update this announcement" });
      return;
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        category,
        title,
        content,
      },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.send({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
  } catch (err) {
    console.error("Update announcement error:", err);
    if (err.code === "P2002") {
      res.status(400).send({ message: "An announcement with this title already exists" });
      return;
    }
    res.status(500).send({ message: `Failed to update announcement: ${err.message}` });
  }
});

export const getAllAnnouncements = asyncHandler(async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.send(announcements);
  } catch (err) {
    console.error("Get all announcements error:", err);
    res.status(500).send({ message: `Failed to fetch announcements: ${err.message}` });
  }
});

export const getMyAnnouncements = asyncHandler(async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    res.status(400).send({ message: "User email is required" });
    return;
  }

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        owner: {
          email: userEmail,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.send(announcements);
  } catch (err) {
    console.error("Get my announcements error:", err);
    res.status(500).send({ message: `Failed to fetch your announcements: ${err.message}` });
  }
});

export const getAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    if (!announcement) {
      res.status(404).send({ message: "Announcement not found" });
      return;
    }
    res.send(announcement);
  } catch (err) {
    console.error("Get announcement error:", err);
    res.status(500).send({ message: `Failed to fetch announcement: ${err.message}` });
  }
});