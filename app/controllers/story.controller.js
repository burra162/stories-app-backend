const db = require("../models");
const Story = db.story;

const Chat = db.chat;
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
        const data = await Story.findAll({ where: { genre: genre } });
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


        const chohereResponse = await axios.post('https://api.cohere.com/v1/chat', {
            model: "command-r-plus",
            message: req.body.message,
            temperature: 0.3,
            chat_history: history,
            stream: false,
            connectors: [{"id":"web-search"}]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const userMessage = await Chat.create(chat);
        const chatMessage = await Chat.create({ role: "Chatbot", message: chohereResponse.data.text, storyId: id });
        history.push(userMessage)
        history.push(chatMessage)
        res.send(history);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Error adding chat to Story with id=" + id,
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

