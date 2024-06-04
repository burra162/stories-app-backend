module.exports = (sequelize, Sequelize) => {
    const Genre = sequelize.define("story", {
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT('long'),
            allowNull: false,
        },
        published: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        genre:{
            type: Sequelize.STRING,
            allowNull: false,
        }
    });

    return Genre;
};