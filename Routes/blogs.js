import express from "express";
import blogModel from "../model.js";

import bodyParser from "body-parser";
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

// To edit a blog

route.put("/edit/:username/:id", async (req, res) => {
  let username = req.params.username,
    blogId = req.params.id;
  let updatedData = req.body.data;
  let user = await blogModel.find({ username: username });
  let changeIndex = user[0].blogs.findIndex((i) => i._id == blogId);
  let data = user[0].blogs;
  let favoriteIndex = user[0].favorites.findIndex((i) => i._id == blogId);
  let updateFavorite = user[0].favorites;
  if (favoriteIndex >= 0) {
    updateFavorite.splice(favoriteIndex, 1, updatedData);
  }
  data.splice(changeIndex, 1, updatedData);
  let update = await blogModel.updateOne(
    { username: username },
    { $set: { blogs: data, favorites: updateFavorite } }
  );
  if (update) {
    res.send({ success: true, message: "Updated successfully" });
  } else {
    res.send({ success: false, message: "Error in updation" });
  }
});

// To get blogs specific to user
route.get("/item/:username", async (req, res) => {
  let user = req.params.username;
  let response = await blogModel.find({ username: user }).select({ blogs: 1 });
  if (response.length > 0) {
    let result = response[0].blogs.map((i) => ({
      username: user,
      title: i.title,
      _id: i._id,
      image: i.image,
      content: i.content,
      related_links: i.related_links,
      likes: i.likes,
      likedUsers: i.likedUsers,
    }));
    res.status(200).send(result);
  } else {
    res.status(400).send({ data: "", message: "Blogs not found" });
  }
});

// To get all blogs
route.get("/all", async (req, res) => {
  let data = await blogModel.find().select({ blogs: 1, username: 1 });
  let page = req.query.page;
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
  if (response.length == 0 || !allDataFromDB.find((i) => i.username === user)) {
    res.send({ message: "User not found" });
    return;
  }
  let favoriteResponse = await blogModel.find({ username: user });

  let findItem = favoriteResponse[0].favorites.find((i) => i._id.equals(id));

  if (findItem) {
    if (findItem.likedUsers.includes(user)) {
      findItem.likes = +findItem.likes - 1;
      findItem.likedUsers.splice(findItem.likedUsers.indexOf(user), 1);
    } else {
      findItem.likes = +findItem.likes + 1;
      findItem.likedUsers.push(user);
    }
    response[0].favorites = favoriteResponse[0].favorites;
    let update = await blogModel.findByIdAndUpdate(
      favoriteResponse[0]._id,
      { $set: favoriteResponse[0] },
      { new: true }
    );
  }

  let result = response[0].blogs.find((i) => i._id.equals(id));
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

route.get("/favorites/:username", async (req, res) => {
  let user = req.params.username;
  let data = await blogModel.find({ username: user });

  let allBlogData = await blogModel.find();
  function returnUsername(id) {
    let str = "";
    allBlogData.forEach((i) =>
      i.blogs.forEach((j) => {
        if (j._id.equals(id)) {
          str = i.username;
        }
      })
    );
    return str;
  }

  if (data.length > 0) {
    let temp = [];
    data[0].favorites.forEach((i) =>
      temp.push({
        username: returnUsername(i._id),
        title: i.title,
        _id: i._id,
        image: i.image,
        related_links: i.related_links,
        likes: i.likes,
        content: i.content,
        likedUsers: i.likedUsers,
      })
    );
    res.status(200).send(temp);
  } else {
    res.status(400).send({ success: false, message: "User not found" });
  }
});

route.put("/favorite/:username", async (req, res) => {
  let reqBody = req.body;
  let user = await blogModel.find({ username: req.params.username });
  if (user[0].favorites.find((i) => i._id == reqBody._id)) {
    let ind = user[0].favorites.findIndex((i) => i._id == reqBody._id);
    user[0].favorites.splice(ind, 1);
    let result = await blogModel.findByIdAndUpdate(user[0]._id, user[0]);
    if (result) {
      res.send({
        success: true,
        username: req.params.username,
        id: user[0]._id,
      });
    }
  } else {
    user[0].favorites.push(reqBody);
    let result = await blogModel.findByIdAndUpdate(user[0]._id, user[0]);
    if (result) {
      res.send({
        success: true,
        username: req.params.username,
        id: user[0]._id,
      });
    }
  }
});

export default route;
