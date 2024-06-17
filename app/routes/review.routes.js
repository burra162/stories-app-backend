module.exports = (app) => {
  var router = require("express").Router();
  const Review = require("../controllers/review.controller.js");

  // Create a new Review
  router.post("/", Review.create);

  // Retrieve all Reviews

  router.get("/", Review.findAll);

  // Retrieve a single Review with id

  router.get("/:id", Review.findOne);

  // Update a Review with id

  router.put("/:id", Review.update);

  // Delete a Review with id

  router.delete("/:id", Review.delete);

  // Delete all Reviews

  router.delete("/", Review.deleteAll);

  app.use("/storyapi/reviews", router);


};