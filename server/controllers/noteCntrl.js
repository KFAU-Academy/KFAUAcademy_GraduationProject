import asyncHandler from 'express-async-handler';
import { prisma } from '../config/prismaConfig.js';
import { ObjectId } from 'mongodb';

export const createNote = asyncHandler(async (req, res) => {
  const { courseName, noteTitle, userEmail } = req.body;
  const image = req.body.image || "note_icon.png";

  if (!req.file) {
    res.status(400).json({ message: 'Lütfen bir not dosyası yükleyin' });
    return;
  }

  if (!courseName || !noteTitle || !userEmail) {
    res.status(400).json({ message: 'courseName, noteTitle ve userEmail alanları zorunludur' });
    return;
  }

  const noteUrl = '/uploads/notes/' + req.file.filename;

  try {
    // userEmail'in User tablosunda var olduğunu kontrol et
    const userExists = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!userExists) {
      res.status(400).json({ message: `User with email ${userEmail} not found` });
      return;
    }

    const note = await prisma.note.create({
      data: {
        courseName,
        noteTitle,
        noteUrl,
        image,
        owner: { connect: { email: userEmail } },
      },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.status(201).json({ message: 'Not başarıyla oluşturuldu', note });
  } catch (err) {
    console.error("Create note error:", {
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
    if (err.code === 'P2002') {
      res.status(400).json({ message: 'Bu not zaten mevcut (noteUrl benzersiz olmalı)' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(400).json({ message: `Invalid user email: ${userEmail}` });
      return;
    }
    res.status(500).json({ message: `Not oluşturulamadı: ${err.message}` });
  }
});

export const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseName, noteTitle, userEmail } = req.body;
  const image = req.body.image || "note_icon.png";
  let noteUrl = null;

  if (!courseName || !noteTitle || !userEmail) {
    res.status(400).json({ message: 'courseName, noteTitle, and userEmail are required' });
    return;
  }

  if (req.file) {
    noteUrl = '/Uploads/notes/' + req.file.filename;
  }

  try {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: `Invalid note ID: ${id}` });
      return;
    }

    const note = await prisma.note.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.userEmail !== userEmail) {
      res.status(403).json({ message: "You are not authorized to update this note" });
      return;
    }

    const updateData = {
      courseName,
      noteTitle,
      image,
    };

    if (noteUrl) {
      updateData.noteUrl = noteUrl;
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.json({ message: 'Note updated successfully', note: updatedNote });
  } catch (err) {
    console.error("Update note error:", err);
    if (err.code === 'P2002') {
      res.status(400).json({ message: 'This note already exists (noteUrl must be unique)' });
      return;
    }
    res.status(500).json({ message: `Failed to update note: ${err.message}` });
  }
});

export const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    res.status(400).json({ message: "User email is required" });
    return;
  }

  try {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: `Invalid note ID: ${id}` });
      return;
    }

    const note = await prisma.note.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.userEmail !== userEmail) {
      res.status(403).json({ message: "You are not authorized to delete this note" });
      return;
    }

    await prisma.note.delete({
      where: { id },
    });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: `Failed to delete note: ${err.message}` });
  }
});

//function to get all anoouncements
export const getAllNotes = asyncHandler(async (req, res)=>{
    const notes = await prisma.note.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
    res.send(notes)
});
export const getMyNotes = asyncHandler(async (req, res) => {
  const userEmail = req.query.email; // Frontend'den gelen query

  if (!userEmail) {
    res.status(400).json({ message: "User email is required" });
    return;
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userEmail },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    res.json(notes);
  } catch (err) {
    console.error("Get my notes error:", err);
    res.status(500).json({ message: `Notlarınız alınamadı: ${err.message}` });
  }
});

export const getNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        owner: {
          select: { fullName: true },
        },
      },
    });
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.send(note);
  } catch (err) {
    console.error("Get note error:", err);
    res.status(500).json({ message: `Not alınamadı: ${err.message}` });
  }
});