import express from "express";
import blogModel from "../model.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
// let __filename = fileURLToPath(import.meta.url);
// let __dirname = path.dirname(__filename);
let route = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, 'public/images'));
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
// });

// To upload a blog
route.post("/:username", async (req, res) => {
  let user = req.params.username;
  let data = await blogModel.find({ username: user });
  let postBlog = {
    ...req.body,
    related_links: JSON.parse(req.body.related_links),
    image: req.body.image,
  };
  let all = data[0].blogs;
  all.push(postBlog);
  let response = await blogModel.updateOne(
    { username: user },
    {
      $set: {
        blogs: all,
      },
    }
  );
  if (response.acknowledged) {
    res.send({
      success: true,
      message: "Blog uploaded successfully",
      id: data[0].blogs[data[0].blogs.length - 1]._id,
    });
  } else {
    res.send({ success: false, message: "Uploading failed" });
  }
});

// To delete a blog
route.delete("/delete/:username/:id", async (req, res) => {
  let user = req.params.username;
  let id = req.params.id;
  let data = await blogModel.find({ username: user });
  console.log(data);
  let updateData = data[0].blogs.filter((i) => i._id != id);
  let response = await blogModel.updateOne(
    { username: user },
    {
      $set: {
        blogs: updateData,
      },
    }
  );
  if (response.acknowledged) {
    res.send({ success: true, message: "Blog deleted successfully" });
  } else {
    res.send({ success: false, message: "Deletion failed" });
  }
});

// To get blogs specific to user
route.get("/item/:username", async (req, res) => {
  let user = req.params.username;
  console.log("username", user);
  let response = await blogModel.find({ username: user }).select({ blogs: 1 });
  if (response.length > 0) {
    let result = response.map((i) => i.blogs);
    res.status(200).send(...result);
  } else {
    res.status(400).send({ data: "", message: "Blogs not found" });
  }
});

// To get all blogs
route.get("/all", async (req, res) => {
  let data = await blogModel.find().select({ blogs: 1 });
  let response = data.map((i) => i.blogs);
  res.status(200).send(response.flat());
});

export default route;
