const db = require("../models");
const User = db.user;
const Session = db.session;
const Op = db.Sequelize.Op;
const { encrypt, getSalt, hashPassword } = require("../authentication/crypto");

// Create and Save a new User
exports.create = async (req, res) => {
  // Validate request
  if (req.body.firstName === undefined) {
    const error = new Error("First name cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while creating user.",
    });
  } else if (req.body.lastName === undefined) {
    const error = new Error("Last name cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while creating user.",
    });
  } else if (req.body.email === undefined) {
    const error = new Error("Email cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while creating user.",
    });
  } else if (req.body.password === undefined) {
    const error = new Error("Password cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while creating user.",
    });
  }

  // find by email
  await User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(async (data) => {

      if (data) {
        res.status(400).send({
          message: "Email already in use. Please use a different email.",
        });
      } else {
        console.log("email not found");

        let salt = await getSalt();
        let hash = await hashPassword(req.body.password, salt);

        // Create a User
        const user = {
          id: req.body.id,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash,
          salt: salt
        };

        // Save User in the database
        await User.create(user)
          .then(async (data) => {
            // Create a Session for the new user
            let userId = data.id;

            let expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 1);

            const session = {
              email: req.body.email,
              userId: userId,
              expirationDate: expireTime,
            };
            await Session.create(session).then(async (data) => {
              let sessionId = data.id;
              let token = await encrypt(sessionId);
              let userInfo = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id,
                type: user.type,
                token: token,
              };
              res.send(userInfo);
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the User.",
            });
          });
      }
    })
    .catch((err) => {
      return err.message || "Error retrieving User with email=" + email;
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id = ${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving User with id = " + id,
      });
    });
};

// Find a single User with an email
exports.findByEmail = (req, res) => {
  const email = req.params.email;

  User.findOne({
    where: {
      email: email,
    },
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.send({ email: "not found" });
        /*res.status(404).send({
          message: `Cannot find User with email=${email}.`
        });*/
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving User with email=" + email,
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  const user = {
    id: req.body.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    type: req.body.type,
  };

  User.update(user, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id = ${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating User with id =" + id,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete User with id = ${id}. Maybe User was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete User with id = " + id,
      });
    });
};

// Delete all People from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} People were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all people.",
      });
    });
};


// Reset password

exports.resetPassword = async (req, res) => {

  
  if (req.body.otp === undefined) {
    const error = new Error("OTP cannot be empty for !");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while resetting password.",
    });
  }
  // check if otp = 1234 for now as we are not sending otp
  if (req.body.otp !== "1234") {
    res.status(400).send({
      message: "Invalid OTP",
    });
  }

  // validate email
  if (req.body.email === undefined) {
    const error = new Error("Email cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while resetting password.",
    });
  }

  // Validate request
  if (req.body.newPassword === undefined) {
    const error = new Error("New password cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while resetting password.",
    });
  }

  if (req.body.confirmPassword === undefined) {
    const error = new Error("Confirm password cannot be empty for user!");
    error.statusCode = 400;
    res.status(400).send({
      message:
        error.message || "Some error occurred while resetting password.",
    });
  }


  let salt = await getSalt();
  let hash = await hashPassword(req.body.confirmPassword, salt);

  const user = {
    password: hash,
    salt: salt,
  };

  User.update(user, {
    where: { email: req.body.email },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User's password was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User's password with id = ${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating User's password with id =" + id,
      });
    });

}