import express from "express";
import blogModel from "../model.js";

let route = express.Router();

route.post("/", async (req, res) => {
  let data = new blogModel(req.body);
  try {
    let response = await blogModel.insertMany(data);
    if (response) {
      res.status(200).send({
        success: true,
        username: req.body.username,
        email: req.body.email,
      });
    }
  } catch (error) {
    res.status(401).send({
      error: true,
      success: false,
      message: "Username or email already exists",
      error: error,
    });
  }
});

route.post("/login", async (req, res) => {
  let email = req.body?.email;
  let password = req.body?.password;
  if (email && password) {
    let response = await blogModel.find({
      email: email,
      password: password,
    });
    let userResponse = await blogModel.find({ email: email });

    if (response.length == 1 && userResponse.length == 1) {
      res.status(200).send({
        success: true,
        message: "Login Successful",
        username: userResponse[0].username,
      });
    } else if (response.length == 0 && userResponse.length == 1) {
      res.status(400).send({
        success: false,
        message: "Password incorrect",
      });
    } else {
      res
        .status(400)
        .send({ success: false, message: "User not found, kindly register" });
    }
  } else {
    res.status(400).send({ success: false, message: "Data not found" });
  }
});

export default route;
