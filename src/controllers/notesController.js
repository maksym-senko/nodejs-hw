import createError from 'http-errors';
import { Note } from '../models/note.js';


export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(
      noteId,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};