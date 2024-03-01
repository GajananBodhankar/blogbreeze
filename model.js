import { File } from "buffer";
import mongoose from "mongoose";

let blogSchema = new mongoose.Schema({
  username: {
    unique: true,
    type: String,
    required: true,
  },
  email: {
    unique: true,
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  blogs: [
    {
      title: { type: String, required: true },
      image: { type: String, required: true },
      content: { type: String, required: true },
      related_links: { type: Array, required: true },
      likes: { type: Number, required: true },
      likedUsers: { type: Array, required: true },
    },
  ],
  favorites: [
    {
      title: { type: String, required: true },
      image: { type: String, required: true },
      content: { type: String, required: true },
      related_links: { type: Array, required: true },
      likes: { type: Number, required: true },
      likedUsers: { type: Array, required: true },
    },
  ],
});

let blogModel = mongoose.model("blogbreezes", blogSchema);

export default blogModel;
