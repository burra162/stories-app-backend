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

  app.use("/storyapi/stories", router);
};
