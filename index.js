import authRoute from "./Routes/auth.js";
import connect from "./database.js";
import blogRoute from "./Routes/blogs.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);
let PORT = process.env.PORT || 3000;
let app = express();
app.use(express.static("public"));
// app.use("/public", express.static(path.join(__dirname, "public")));
// app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
// app.use(
//   express.urlencoded({ parameterLimit: 1000000, limit: "500mb", extended: true })
// );
app.use(
  cors({
    origin: "*",
  })
);

app.use("/blogbreeze/auth", authRoute);

app.use("/blogbreeze/blogs", blogRoute);

app.listen(PORT, () => {
  console.log("listening to port", PORT);
});
