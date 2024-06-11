const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.genre = require("./genre.model.js")(sequelize, Sequelize);
db.story = require("./story.model.js")(sequelize, Sequelize);
db.chat = require("./chat.model.js")(sequelize, Sequelize);
db.favorite = require("./favorite.model.js")(sequelize, Sequelize);

// foreign key for session
db.user.hasMany(
  db.session,
  { as: "session" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.session.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);




// foreign key for story and user

db.user.hasMany(
  db.story,
  { as: "story" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

db.story.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

// foreign key for stor and chat

db.story.hasMany(
  db.chat,
  { as: "chat" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

db.chat.belongsTo(
  db.story,
  { as: "story" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

// foreign key for user and genres

db.user.belongsToMany(db.genre, {
  through: "user_genres",
  as: "genres",
  foreignKey: "userId",
});

db.genre.belongsToMany(db.user, {
  through: "user_genres",
  as: "users",
  foreignKey: "genreId",
});


// foreign key for user and favorite

db.user.belongsToMany(db.story, {
  through: "favorite_stories",
  as: "favorite",
  foreignKey: "userId",
});

db.story.belongsToMany(db.user, {
  through: "favorite_stories",
  as: "users",
  foreignKey: "storyId",
});


module.exports = db;
