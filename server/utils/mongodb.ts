import mongoose from "mongoose";

export const isValidObjectId = (id?: string) => Boolean(id && mongoose.Types.ObjectId.isValid(id));

export const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

export const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getObjectIdOrThrow = (id?: string) => {
  if (!id || !isValidObjectId(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid service id",
    });
  }

  return id;
};
