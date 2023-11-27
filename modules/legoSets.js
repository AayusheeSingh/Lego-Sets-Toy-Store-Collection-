

/************ ADDED REQUIRED  DEPENDENCIES  ***************** */
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});


/***************** DEFINING THEME AND SETS MODELS *********** */

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return sequelize
    .sync()
    .then(() => {
      console.log('Database synced successfully');
    })
    .catch((err) => {
      throw new Error(`Unable to sync database: ${err}`);
    });
}


/******************* GETTING ALL SETS  ************* */
function getAllSets() {
  return Set.findAll({ include: [Theme] })
    .then((sets) => {
      if (sets.length === 0) {
        throw new Error('No sets available');
      }
      return sets.map((set) => ({ ...set.dataValues, theme: set.Theme.name }));
    });
}


/*********************GETTING SETS BY NUM***************************   */
function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme],
  }).then((set) => {
    if (!set) {
      throw new Error('Unable to find requested set');
    }
    return { ...set.dataValues, theme: set.Theme.name };
  });
}

/*********************GETTING SETS BY THEME ***************************   */

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((sets) => {
    if (sets.length === 0) {
      throw new Error('Unable to find requested sets');
    }
    return sets.map((set) => ({ ...set.dataValues, theme: set.Theme.name }));
  });
}
/************************ADD THE SET ***************************** */
function addSet(setData) {
  return Set.create(setData)
    .then(() => {})
    .catch((err) => {
      throw new Error(err.errors[0].message);
    });
}
function getAllThemes() {
  return Theme.findAll()
    .then((themes) => themes.map((theme) => ({ id: theme.id, name: theme.name })))
    .catch((err) => {
      throw new Error(err);
    });
}


/*********************EDIT THE SET ******************************** */
async function editSet(setNum, setData) {
  try {
    const result = await Set.update(setData, {
      where: { set_num: setNum },
    });

    if (result[0] === 0) {
      throw new Error('Unable to find and update the requested set');
    }
  } catch (error) {
    throw new Error(error.errors[0].message);
  }
}

/********************* DELETE THE SET ************************** */

async function deleteSet(setNum) {
  try {
    const result = await Set.destroy({
      where: { set_num: setNum },
    });

    if (result === 0) {
      throw new Error('Unable to find and delete the requested set');
    }
  } catch (error) {
    throw new Error(error.errors[0].message);
  }
}

/******************** MODULES  TO EXPORT  ****************************** */
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet, Theme, Set };

 


