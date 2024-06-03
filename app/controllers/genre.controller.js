const db = require("../models");
const Genre = db.genre;

exports.create = async (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("Name cannot be empty for genre!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while creating genre.",
    });
  } 

  // Create a Genre
  const genre = {
    name: req.body.name,
  };

  // Save Genre in the database
  Genre.create(genre)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Genre.",
      });
    });

};


// get all genres
exports.findAll = async (req, res) => {
  Genre.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving genres.",
      });
    });
}


// get one genre by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Genre.findByPk(id)
    .then((data) => {
      if (data === null) {
        res.status(404).send({
          message: "Not found Genre with id " + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Genre with id=" + id,
      });
    });
}

// update a genre by id
exports.update = async (req, res) => {
  const id = req.params.id;

  Genre.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Genre was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Genre with id=${id}. Maybe Genre was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Genre with id=" + id,
      });
    });
}



// delete a genre by id

exports.delete = async (req, res) => {
  const id = req.params.id;

  Genre.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Genre was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Genre with id=${id}. Maybe Genre was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Genre with id=" + id,
      });
    });
}


// delete all genres

exports.deleteAll = async (req, res) => {
  Genre.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Genres were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all genres.",
      });
    });
}