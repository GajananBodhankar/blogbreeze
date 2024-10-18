import mongoose from "mongoose";

let connect = await mongoose.connect("");
console.log("Connected to database");

export default connect;
