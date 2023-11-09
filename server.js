/********************************************************************************
* WEB322 – Assignment 04
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Aayushee Singh        Student ID: __173927211___ Date: __08-11-2023____________
*
* Published URL: ___________________________________________________________
*
********************************************************************************/


const express = require('express');
const legoData = require('./modules/legoSets');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

legoData.initialize().then(function() {
  app.listen(port, function() {
    console.log('Server is running on port ' + port);
  });
});

app.get('/', function(req, res) {
  res.render("home"); // Render the "home.ejs" view
});

app.get('/about', function(req, res) {
  res.render("about"); // Render the "about.ejs" view
});

// Changes start here
app.get('/lego/sets', function(req, res) {
  const theme = req.query.theme; // Get the theme from the query parameter
  if (theme) {
    // Handle sets by theme
    legoData.getSetsByTheme(theme)
      .then(function(sets) {
        res.render("sets", { sets: sets }); // Render the "sets.ejs" view with the sets data
      })
      .catch(function(error) {
        res.status(500).send(error);
      });
  } else {
    // Handle all sets
    legoData.getAllSets()
      .then(function(sets) {
        res.render("sets", { sets: sets }); // Render the "sets.ejs" view with the sets data
      })
      .catch(function(error) {
        res.status(500).send(error);
      });
  }
});
// Changes end here

app.get('/lego/sets/:set_num', function (req, res) {
  const setNum = req.params.set_num;
  legoData.getSetByNum(setNum)
      .then(function (set) {
          res.render("set", { set: set }); // Render the "set.ejs" view with the set data
      })
      .catch(function (error) {
          res.status(500).send(error);
      });
});


app.use(express.static('public'));

app.use(function(req, res, next) {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});





