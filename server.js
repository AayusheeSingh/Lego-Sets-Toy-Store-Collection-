/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name:   Aayushee Singh       Student ID: ___173927211     Date: ____13-12-2023__________
*
*  Published URL: _________https://eagle-suspenders.cyclic.app__________________________________________________
*
********************************************************************************/



const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');

const app = express();
const PORT = process.env.PORT || 3000;

/*********************************** Middleware *************************************/
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

/*************************** Middleware for error handling ***********************/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { message: 'Something went wrong on the server', page: req.url });
});

/************************** Initialization middleware **************************/
app.use(async (req, res, next) => {
  try {
    await legoData.initialize(app);
    await authData.initialize();

    next();
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).send('Initialization error');
  }
});

/************************** Client Session Middleware **************************/
app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

/************************* Middleware for Session Access ************************/
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/********************* Navbar item for Add Set ********************************/
app.use((req, res, next) => {
  res.locals.page = req.path;
  next();
});

/*********************** Helper Middleware Function ***************************/
const ensureLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

// Routes
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));

// Sets route
app.get('/lego/sets', async (req, res) => {
  try {
    const theme = req.query.theme;
    const sets = theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();
    res.render('sets', { sets });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/lego/sets/:set_num', async (req, res) => {
  const setNum = req.params.set_num;
  try {
    const set = await legoData.getSetByNum(setNum);
    res.render('set', { set });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Add set route
app.get('/lego/addSet', ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (error) {
    res.status(500).render('500', { message: `Error retrieving themes: ${error}`, page: '/lego/addSet' });
  }
});

app.post('/lego/addSet', ensureLogin, async (req, res) => {
  try {
    const setData = {
      set_num: req.body.set_num,
      name: req.body.name,
      year: parseInt(req.body.year),
      num_parts: parseInt(req.body.num_parts),
      img_url: req.body.img_url,
      theme_id: parseInt(req.body.theme_id),
    };
    await legoData.addSet(setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `Error adding set: ${error}`, page: '/lego/addSet' });
  }
});

// Edit set route
app.get('/lego/editSet/:set_num', ensureLogin, async (req, res) => {
  try {
    const setNum = req.params.set_num;
    const [set, themes] = await Promise.all([
      legoData.getSetByNum(setNum),
      legoData.getAllThemes()
    ]);

    res.render('editSet', { themes, set });
  } catch (error) {
    res.status(404).render('404', { message: `Error getting set or themes: ${error}` });
  }
});

app.post('/lego/editSet', ensureLogin, async (req, res) => {
  try {
    const setNum = req.body.set_num;
    const setData = {
      name: req.body.name,
      year: parseInt(req.body.year),
      num_parts: parseInt(req.body.num_parts),
      img_url: req.body.img_url,
      theme_id: parseInt(req.body.theme_id),
    };

    await legoData.editSet(setNum, setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

app.get('/lego/deleteSet/:set_num', ensureLogin, async (req, res) => {
  try {
    const setNum = req.params.set_num;
    await legoData.deleteSet(setNum);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}`, page: '/lego/deleteSet' });
  }
});


app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null, userName: '' });
});

app.get('/register', (req, res) => {
  res.render('register', { successMessage: null, errorMessage: null, userName: '' });
});


app.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    await authData.registerUser(userData);
    res.render('register', { successMessage: 'User created' });
  } catch (err) {
    res.render('register', { errorMessage: err, userName: req.body.userName, successMessage: null });
  }
});


// POST route for login
// POST route for login
app.post('/login', async (req, res) => {
  try {
    req.body.userAgent = req.get('User-Agent');
    const user = await authData.checkUser(req.body);
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory,
    };
    console.log('Session User:', req.session.user); // Add this line
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('login', { errorMessage: err, userName: req.body.userName });
  }
});


// GET route for logout
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});


app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory', { session: req.session }); // Pass the session object to the view
});



// 404 route
app.use((req, res, next) => {
  res.status(404).render('404', { message: "I'm sorry, we're unable to find what you're looking for" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
