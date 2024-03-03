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
    likes: 0,
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
  let page = req.query.page;
  // res.send({ success: true, page: req.query.page });
  let result = data
    .map((i) =>
      i.blogs
        .map((j) => ({
          username: i.username,
          title: j.title,
          _id: j._id,
          image: j.image,
          content: j.content,
          related_links: j.related_links,
          likes: j.likes,
          likedUsers: j.likedUsers,
        }))
        .flat()
    )
    .flat();
  let sentData = result.filter((i, j) => j >= (page - 1) * 9 && j < page * 9);

  if (result.filter((i, j) => j >= page * 9).length > 0) {
    res.send({ data: sentData, hasNext: true });
  } else {
    res.send({ data: sentData, hasNext: false });
  }
});

route.put("/likes/:username/:blogId", async (req, res) => {
  let data = req.body;
  let id = req.params.blogId;
  let user = req.params.username;
  let response = await blogModel.find({ username: data.username });

  let allDataFromDB = await blogModel.find();
  if (response.length == 0 || !allDataFromDB.find((i) => i.username == user)) {
    res.send({ message: "User not found" });
    return;
  }
  let result = response[0].blogs.find((i) => i._id == id);
  if (result.likedUsers.includes(user)) {
    result.likes = +result.likes - 1;
    result.likedUsers.splice(result.likedUsers.indexOf(user), 1);
  } else {
    result.likes = +result.likes + 1;
    result.likedUsers.push(user);
  }
  let update = await blogModel.findByIdAndUpdate(
    response[0]._id,
    {
      $set: response[0],
    },
    { new: true }
  );
  res.send({ success: true, id: response[0]._id, data: update });
});

route.put("/favorite/:username", async (req, res) => {
  let reqBody = req.body;
  let user = await blogModel.find({ username: req.params.username });
  // if (user[0].favorites.find((i) => i.id == reqBody.id)) {
  //   console.log(true);
  // } else {
  //   console.log(false);
  // }
  console.log(
    user[0].favorites.map((i) => i.id),
    reqBody.id
  );
  user[0].favorites.push(reqBody);
  console.log(user[0].favorites, req.params.username);
  // let result = await blogModel.updateOne(
  //   { username: req.params.username },
  //   {
  //     $push: {
  //       "blogs.0.favorites": [reqBody],
  //     },
  //   }
  // );
  // if (result) {
  //   res.send({ success: true, username: req.params.username, id: user[0]._id });
  // }
  // console.log(reqBody);
  // res.send(reqBody);
  // let data = await blogModel.findByIdAndUpdate()
  // console.log(data[0].favorites);
});

export default route;
