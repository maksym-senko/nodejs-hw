import createError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, perPage = 10, tag, search } = req.query;

    const pageNumber = Number(page);
    const perPageNumber = Number(perPage);
    const skip = (pageNumber - 1) * perPageNumber;

    const notesQuery = Note.find().where('userId').equals(userId);

    if (tag) {
      notesQuery.where('tag').equals(tag);
    }

    if (search) {
      notesQuery.where({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const countQuery = Note.find().where('userId').equals(userId).merge(notesQuery);

    const [totalNotes, notes] = await Promise.all([
      countQuery.countDocuments(),
      notesQuery.skip(skip).limit(perPageNumber),
    ]);

    const totalPages = Math.ceil(totalNotes / perPageNumber);

    res.status(200).json({
      page: pageNumber,
      perPage: perPageNumber,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      req.body,
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};