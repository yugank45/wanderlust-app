const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  // console.log(req.body.review);

  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview._id);
  await listing.save();

  // 🔥 NOW use SAME listing for update
  listing = await Listing.findById(req.params.id).populate("reviews");

  let total = listing.reviews.reduce((sum, rev) => sum + rev.rating, 0);

  listing.reviewCount = listing.reviews.length;
  listing.rating = listing.reviewCount ? total / listing.reviewCount : 0;

  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  let listing = await Listing.findById(id).populate("reviews");

  let total = listing.reviews.reduce((sum, rev) => sum + rev.rating, 0);

  listing.reviewCount = listing.reviews.length;
  listing.rating = listing.reviewCount ? total / listing.reviewCount : 0;

  await listing.save();

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
