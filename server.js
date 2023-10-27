/******************************************************************************** *  WEB322 – Assignment 03 
*  
*	I declare that this assignment is my own work in accordance with Seneca's *  Academic Integrity Policy: 
*  
*	hRps://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*	Name: __Aayushee Singh____ Student ID: __173927211____ Date: _27th October,2023__ 
* 
*	Published URL: ___________________________________________________________ 
* 
********************************************************************************/ 




const express = require('express');
const legoData = require('./modules/legoSets');

const app = express();
const port = process.env.PORT || 3000;

legoData.initialize().then(function() {
  app.listen(port, function() {
    console.log('Server is running on port ' + port);
  });
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/views/about.html');
});

app.get('/lego/sets', function(req, res) {
  const theme = req.query.theme; // Get the theme from the query parameter
  if (theme) {
    // Handle sets by theme
    legoData.getSetsByTheme(theme)
      .then(function(sets) {
        res.json(sets);
      })
      .catch(function(error) {
        res.status(500).send(error);
      });
  } else {
    // Handle all sets
    legoData.getAllSets()
      .then(function(sets) {
        res.json(sets);
      })
      .catch(function(error) {
        res.status(500).send(error);
      });
  }
});

app.get('/lego/sets/:set_num', function(req, res) {
  const setNum = req.params.set_num; // Get the set number from the URL
  legoData.getSetByNum(setNum)
    .then(function(set) {
      res.json(set);
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
});

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + '/views/404.html');
});





