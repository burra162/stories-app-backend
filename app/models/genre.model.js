module.exports = (sequelize, Sequelize) => {
    const Genre = sequelize.define("genre", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });

    return Genre;
};