import mongoose from "mongoose";

let connect = await mongoose.connect("mongodb+srv://bodhankargajanan99:9766536784@gajanandb.xtmlweq.mongodb.net/GajananDB");
console.log("Connected to database");

export default connect;
