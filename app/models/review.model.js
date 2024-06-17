module.exports = (sequelize, Sequelize) => {
    const Review = sequelize.define("review", {
        review:{
            type: Sequelize.STRING,
            allowNull: false,
        }
    });

    return Review;
};