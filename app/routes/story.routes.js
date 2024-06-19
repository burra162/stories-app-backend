module.exports = (app) => {
  var router = require("express").Router();

  var Story = require("../controllers/story.controller.js");

  // Create a new Genre
  router.post("/", Story.create);

  // Retrieve all Stories
  router.get("/", Story.findAll);

  // Retrieve a single Story with id

  router.get("/:id", Story.findOne);

  // Update a Story with id

  router.put("/:id", Story.update);

  // Delete a Story with id

  router.delete("/:id", Story.delete);

  // Delete all Stories

  router.delete("/", Story.deleteAll);

  // Retrieve all published Stories

  router.get("/published", Story.findAllPublished);

  // Retrieve all Stories of a genre

  router.get("/genre/:genre", Story.findAllByGenre);

  // Retrieve all Stories of a user

  router.get("/user/:userId", Story.findAllByUser);


  // Add a chat to a story

  router.post("/:id/chat", Story.addChat);

  // Retrieve all chats of a story

  router.get("/:id/chat", Story.findAllChats);


  // Retrieve all suggested stories for a user

  router.get("/suggested/:userId", Story.findAllSuggested);

  // Retrieve all favorite stories for a user
  router.get("/favorite/:userId", Story.findAllFavorites);

  // Check if a story is favorite for a user
  router.get("/isFavorite/:storyId/:userId", [authenticateRoute], Story.isFavorite);

  // add story to favorite for a user
  router.post("/addFavorite/:storyId/:userId", [authenticateRoute], Story.addFavorite);

  // remove story from favorite for a user
  router.delete("/removeFavorite/:storyId/:userId", [authenticateRoute], Story.removeFavorite);

  // Retrieve all reading list stories for a user
  router.get("/readingList/:userId", Story.findAllReadingList);

  // Check if a story is in reading list for a user
  router.get("/isReadingList/:storyId/:userId", [authenticateRoute], Story.isInReadingList);

  // add story to reading list for a user
  router.post("/addReadingList/:storyId/:userId", [authenticateRoute], Story.addToReadingList);

  // remove story from reading list for a user
  router.delete("/removeReadingList/:storyId/:userId", [authenticateRoute], Story.removeFromReadingList);

  // Get all reviews for a story
  router.get("/:storyId/reviews", Story.findAllReviews);


  app.use("/storyapi/stories", router);
};
