const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data } = require("./data.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected To MongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
// 🔥 Transform data here
// const allListings = data.map((item) => ({
//   ...item,
//   owner: "69d0d090b633dce2184d1b90", // Replace with actual user ID
//   image: item.image.url, // extract only URL
// }));
const initDb = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(data);
  console.log("Data inserted");
};

initDb();
