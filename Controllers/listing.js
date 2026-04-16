const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url + " " + filename);
  const listing = new Listing(req.body.listing);

  listing.owner = req.user._id; // Set the owner to the currently logged-in user
  listing.image = { url, filename };
  listing.geometry = response.body.features[0].geometry; // Set the geometry from the geocoding response
  let savedListing = await listing.save();
  console.log(savedListing);
  req.flash("success", "Listing created successfully!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_300/");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
  console.log("Blur URL:", originalImageUrl);
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const deletedList = await Listing.findByIdAndDelete(id);
  console.log(deletedList);
  req.flash("success", "Listing Deleted successfully!");
  res.redirect("/listings");
};

module.exports.index = async (req, res) => {
  const { category } = req.query;

  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("index.ejs", { allListings, category });
};

module.exports.index = async (req, res) => {
  let { category, q } = req.query;

  let query = {};

  // 🔍 Search logic
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  // 🏷️ Category filter
  if (category) {
    query.category = category;
  }

  const allListings = await Listing.find(query);

  res.render("index.ejs", { allListings, category, q });
};
