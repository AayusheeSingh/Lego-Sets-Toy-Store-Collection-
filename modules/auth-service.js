const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; 

function initialize() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on('error', (err) => {
      reject(err); 
    });
    db.once('open', () => {
      User = db.model('users', userSchema);
      resolve();
    });
  });
}

async function registerUser(userData) {
    return new Promise(async function (resolve, reject) {
      if (userData.password !== userData.password2) {
        reject('Passwords do not match');
      } else {
        try {
          const hash = await bcrypt.hash(userData.password, 10);
          userData.password = hash;
          let newUser = new User(userData);
          await newUser.save();
          resolve('User registered successfully');
        } catch (err) {
          if (err.code === 11000) {
            reject('User Name already taken');
          } else {
            reject(`There was an error creating the user: ${err}`);
          }
        }
      }
    });
  }
  

  async function checkUser(userData) {
    return new Promise(async function (resolve, reject) {
      try {
        const users = await User.find({ userName: userData.userName });
  
        if (users.length === 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          const result = await bcrypt.compare(userData.password, users[0].password);
          if (result) {
            resolve('Password is correct');
          } else {
            reject(`Incorrect Password for user: ${userData.userName}`);
          }
        }
      } catch (err) {
        reject(`Unable to find user: ${userData.userName}`);
      }
    });
  }
  

module.exports = {
  initialize,
  registerUser,
  checkUser,
  
};