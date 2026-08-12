import mongoose from "mongoose";

export const isValidObjectId = (id?: string) => Boolean(id && mongoose.Types.ObjectId.isValid(id));

export const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

export const getObjectIdOrThrow = (id?: string) => {
  if (!isValidObjectId(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid service id",
    });
  }

  return id;
};
