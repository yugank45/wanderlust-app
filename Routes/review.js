const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../Utils/wrapAsync.js");
const ExpressError = require("../Utils/ExpressError.js");
const { reviewSchema } = require("../Schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedin, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../Controllers/reviews.js");
//Reviews
//Post Route
router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.createReview),
);

//Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview),
);

module.exports = router;
