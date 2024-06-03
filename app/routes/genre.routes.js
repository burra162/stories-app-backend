module.exports = (app) => {
  var router = require("express").Router();
  const Genre = require("../controllers/genre.controller.js");

  // Create a new Genre
  router.post("/", Genre.create);

  // Retrieve all Genres
  router.get("/", Genre.findAll);

  // Retrieve a single Genre with id
  router.get("/:id", Genre.findOne);

  // Update a Genre with id
  router.put("/:id", Genre.update);

  // Delete a Genre with id
  router.delete("/:id", Genre.delete);

  // Delete all Genres
  router.delete("/", Genre.deleteAll);
  
  app.use("/storyapi/genres", router);
};
