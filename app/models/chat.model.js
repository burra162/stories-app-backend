
module.exports = (sequelize, Sequelize) => {
  const Chat = sequelize.define("chat", {
    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    }
  });

  return Chat;
};
