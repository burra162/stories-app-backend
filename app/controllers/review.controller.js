const db = require("../models");
const Review = db.review;
const User = db.user;

// Create and Save a new Review

exports.create = (req, res) => {
    // Validate request
    if (!req.body.review) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Review
    const review = {
        review: req.body.review,
        storyId: req.body.storyId,
        userId: req.body.userId,
    };

    // Save Review in the database
    Review.create(review)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Review."
            });
        });
}


// Retrieve all Reviews from the database.

exports.findAll = (req, res) => {
    const review = req.query.review;
    var condition = review ? { review: { [Op.like]: `%${review}%` } } : null;

    Review.findAll({ where: condition, include: [{ model: User, as: "user", attributes: ["id", "username"]}]})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}

// Find a single Review with an id

exports.findOne = (req, res) => {

    const id = req.params.id;

    Review.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Review with id=" + id
            });
        });
}

// Find all Reviews for a story

exports.findAllForStory = (req, res) => {

    const storyId = req.params.storyId;

    Review.findAll({ where: { storyId: storyId }, include: [{ model: User, as: "user", attributes: ["id", "username"]}] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Review with storyId=" + storyId
            });
        }
        );
}

// Update a Review by the id in the request

exports.update = (req, res) => {
    const id = req.params.id;

    Review.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Review was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Review with id=${id}. Maybe Review was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Review with id=" + id
            });
        });
}


// Delete a Review with the specified id in the request

exports.delete = (req, res) => {
    const id = req.params.id;

    Review.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Review was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Review with id=${id}. Maybe Review was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Review with id=" + id
            });
        });
}

// Delete all Reviews from the database.

exports.deleteAll = (req, res) => {
    Review.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} Reviews were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all reviews."
            });
        });
}
