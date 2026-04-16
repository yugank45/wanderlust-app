const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;
  await newReview.save(); // Set the author to the currently logged-in user
  listing.reviews.push(newReview);
  await listing.save();
  console.log("Review Added!");
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    console.log("Review Deleted!");
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  }