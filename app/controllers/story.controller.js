const db = require("../models");
const Story = db.story;
const User = db.user;
const Chat = db.chat;
const Review = db.review;
const axios = require('axios');

// Create and Save a new Story

exports.create = async (req, res) => {

    // Validate request
    if (req.body.title === undefined) {
        const error = new Error("Title cannot be empty for story!");
        error.statusCode = 400;
        res.status(400).send({
            message:
                error.message || "Some error occurred while creating story.",
        });
    }
    // Create a Story
    const story = {
        title: req.body.title,
        description: req.body.description ? req.body.description : "",
        published: req.body.published ? req.body.published : false,
        genre: req.body.genre,
        userId: req.body.userId,
    };

    // Save Story in the database

    try {
        const data = await Story.create(story);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the story.",
        });
    }
}

// Retrieve all Stories from the database.


exports.findAll = async (req, res) => {
    try {
        const data = await Story.findAll({ include: { model: db.user, as: "user", attributes: ['id', 'firstname', "lastName"] } });
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving stories.",
        });
    }
}

// Find a single Story with an id


exports.findOne = async (req, res) => {

    const id = req.params.id;

    try {
        const data = await Story.findByPk(id);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Story with id=" + id,
        });
    }
}


//  Update a Story by the id in the request

exports.update = async (req, res) => {

    const id = req.params.id;

    try {
        const data = await Story.update(req.body, {
            where: { id: id },
        });
        if (data == 1) {
            res.send({
                message: "Story was updated successfully.",
            });
        } else {
            res.send({
                message: `Cannot update Story with id=${id}. Maybe Story was not found or req.body is empty!`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Story with id=" + id,
        });
    }
}




// Delete a Story with the specified id in the request

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Story.destroy({
            where: { id: id },
        });
        if (data == 1) {
            res.send({
                message: "Story was deleted successfully!",
            });
        } else {
            res.send({
                message: `Cannot delete Story with id=${id}. Maybe Story was not found!`,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Story with id=" + id,
        });
    }
}



// Delete all Stories from the database.

exports.deleteAll = async (req, res) => {


    try {
        const data = await Story.destroy({
            where: {},
            truncate: false,
        });
        res.send({ message: `${data} Stories were deleted successfully!` });
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing all stories.",
        });
    }
}



// Find all published Stories

exports.findAllPublished = async (req, res) => {

    try {
        const data = await Story.findAll({ where: { published: true } });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving stories.",
        });
    }
}

// Find all Stories by genre

exports.findAllByGenre = async (req, res) => {

    const genre = req.params.genre;

    try {
        const data = await Story.findAll({ where: { genre: genre, published: true } });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving stories.",
        });
    }
}


// Find all Stories by user

exports.findAllByUser = async (req, res) => {

    const userId = req.params.userId;

    try {
        const data = await Story.findAll({ where: { userId: userId } });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving stories.",
        });
    }
}


// Add a chat to a story

exports.addChat = async (req, res) => {

    if (req.body.message === undefined) {
        const error = new Error("Message cannot be empty for chat!");
        error.statusCode = 400;
        res.status(400).send({
            message:
                error.message || "Some error occurred while adding chat to story.",
        });

    }
    const id = req.params.id;

    try {
        const chat = {
            role: "User",
            message: req.body.message,
            storyId: id,
        };
        const history = await Chat.findAll({ where: { storyId: id } });


        const cohereResponse = await axios.post('https://api.cohere.com/v1/chat', {
            model: "command-r-plus",
            message: req.body.message,
            temperature: 0.3,
            chat_history: history,
            stream: false,
            connectors: [{ "id": "web-search" }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const userMessage = await Chat.create(chat);
        const chatMessage = await Chat.create({ role: "Chatbot", message: cohereResponse.data.text, storyId: id });
        history.push(userMessage)
        history.push(chatMessage)
        res.send(history);
    } catch (err) {
        res.status(500).send({
            message: "Error adding chat to Story with id=" + id + err,
        });
    }
}


// Find all chats of a story

exports.findAllChats = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Chat.findAll({ where: { storyId: id } });
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Error retrieving Chats with storyId=" + id,
        });
    }
}



// Find all suggested stories for a user
exports.findAllSuggested = async (req, res) => {

    // get user id from request
    const userId = req.params.userId;

    const user = await db.user.findByPk(userId);

    // get user genres
    const genres = user.genres;

    // get all stories
    const stories = await Story.findAll();

    // filter stories by genre and publish status

    const suggestedStories = stories.filter((story) => {
        return genres.includes(story.genre) && story.published;
    }
    );

    if (suggestedStories.length === 0) {
        Story.findAll().then((data) => {
            res.send(data);
        }
        ).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving stories.",
            });
        });

    }
    // 
    res.send(suggestedStories);
}

// get all favorite stories of a user

exports.findAllFavorites = async (req, res) => {

    const userId = req.params.userId;

    try {
        const user = await User.findByPk(userId, { include: "favorite" });
        res.send(user.favorite);
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving favorite stories!",
        });
    }
}

// add a story to favorites

exports.addFavorite = async (req, res) => {

    const userId = req.params.userId;
    const storyId = req.params.storyId;

    try {
        const user = await User.findByPk(userId);
        const story = await Story.findByPk(storyId);

        await user.addFavorite(story);
        res.send({ message: "Story added to favorites!" });
    } catch (err) {
        res.status(500).send({
            message: "Error adding story to favorites!",
        });
    }
}


// remove a story from favorites

exports.removeFavorite = async (req, res) => {

    const userId = req.params.userId;
    const storyId = req.params.storyId;

    try {
        const user = await User.findByPk(userId);
        const story = await Story.findByPk(storyId);

        await user.removeFavorite(story);
        res.send({ message: "Story removed from favorites!" });
    }
    catch (err) {
        res.status(500).send({
            message: "Error removing story from favorites!",
        });
    }
}

// check if a story is favorite for a user

exports.isFavorite = async (req, res) => {

    const userId = req.params.userId;
    const storyId = req.params.storyId;

    try {
        const user = await User.findByPk(userId);
        const story = await Story.findByPk(storyId);

        const isFavorite = await user.hasFavorite(story);
        res.send({ isFavorite: isFavorite });
    } catch (err) {
        res.status(500).send({
            message: "Error checking if story is favorite!",
        });
    }
}

// find all stories in reading list of a user   

exports.findAllReadingList = async (req, res) => {
    
        const userId = req.params.userId;
    
        try {
            const user = await User.findByPk(userId, { include: "readinglist" });
            res.send(user.readinglist);
        } catch (err) {
            res.status(500).send({
                message: "Error retrieving reading list!",
            });
        }
    }


// add a story to reading list

exports.addToReadingList = async (req, res) => {
    
        const userId = req.params.userId;
        const storyId = req.params.storyId;
    
        try {
            const user = await User.findByPk(userId);
            const story = await Story.findByPk(storyId);
    
            await user.addReadinglist(story);
            res.send({ message: "Story added to reading list!" });
        } catch (err) {
            res.status(500).send({
                message: "Error adding story to reading list!",
            });
        }
    }


// remove a story from reading list

exports.removeFromReadingList = async (req, res) => {

    const userId = req.params.userId;
    const storyId = req.params.storyId;

    try {
        const user = await User.findByPk(userId);
        const story = await Story.findByPk(storyId);

        await user.removeReadinglist(story);
        res.send({ message: "Story removed from reading list!" });
    }
    catch (err) {
        res.status(500).send({
            message: "Error removing story from reading list!",
        });
    }
}

// check if a story is in reading list for a user

exports.isInReadingList = async (req, res) => {

    const userId = req.params.userId;
    const storyId = req.params.storyId;

    try {
        const user = await User.findByPk(userId);
        const story = await Story.findByPk(storyId);

        const isInReadingList = await user.hasReadinglist(story);
        res.send({ isInReadingList: isInReadingList });
    }
    catch (err) {
        res.status(500).send({
            message: "Error checking if story is in reading list!",
        });
    }
}



// Find all Reviews for a story

exports.findAllReviews = async (req, res) => {
    
    const storyId = req.params.storyId;
    console.log(storyId);

    try {
        const data = await Review.findAll({ where: { storyId: storyId }, include: [{ model: User, as: "user", attributes: ["id", "firstname", "lastname"]}] });
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Error retrieving Review with storyId=" + storyId,
        });
    }
}

