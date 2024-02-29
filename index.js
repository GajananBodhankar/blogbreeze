import authRoute from "./Routes/auth.js";
import connect from "./database.js";
import blogRoute from "./Routes/blogs.js";
import express from "express";
import cors from "cors";
let PORT = process.env.PORT || 3000;
let app = express();
app.use(express.static("public"));

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use("/blogbreeze/auth", authRoute);

app.use("/blogbreeze/blogs", blogRoute);

app.listen(PORT, () => {
  console.log("listening to port", PORT);
});
