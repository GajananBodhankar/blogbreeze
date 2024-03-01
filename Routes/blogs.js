import express from "express";
import blogModel from "../model.js";

import bodyParser from "body-parser";
// let __filename = fileURLToPath(import.meta.url);
// let __dirname = path.dirname(__filename);
let route = express.Router();
route.use(
  express.urlencoded({
    parameterLimit: 1000000,
    limit: "500mb",
    extended: true,
  })
);
route.use(bodyParser.json({ limit: "50mb" }));
route.use(express.json({ limit: "50mb" }));
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
  let data = await blogModel.find().select({ blogs: 1, username: 1 });
  let temp = [];
  data.forEach((i) => {
    i.blogs.forEach((j) => {
      temp.push({
        username: i.username,
        title: j.title,
        id: j._id,
        image: j.image,
        content: j.content,
        related_links: j.related_links,
      });
    });
  });
  res.send(temp);
});

export default route;
