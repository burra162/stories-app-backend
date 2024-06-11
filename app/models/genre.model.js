module.exports = (sequelize, Sequelize) => {
    const Genre = sequelize.define("genre", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        image:{
            type: Sequelize.STRING,
            allowNull: true,
        }
    });

    return Genre;
};