const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'pages')));


const users = [
  { username: 'administrator', password: 'admin', role: 'admin' },
  { username: 'wiener', password: 'peter', role: 'user' },
  { username: 'amiwla', password: 'ami123', role: 'user' }
];


app.get('/admin_panel.html', (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied. Only admins can access this page.');
  }
  next(); 
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = user;
    res.redirect('/welcome.html');
  } else {
    res.send('<h2>Login failed. <a href="/login.html">Try again</a></h2>');
  }
});


app.get('/welcome-data', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  res.json({
    username: req.session.user.username,
    role: req.session.user.role
  });
});


app.post('/admin_panel', (req, res) => {
  const referer = req.get('Referer');

  if (!referer || !referer.includes('/admin_panel.html')) {
    return res.status(403).send('Access denied: invalid referer');
  }

  const { username, action } = req.body;
  const user = users.find(u => u.username === username);

  if (user) {
    if (action === 'upgrade') {
      user.role = 'admin'; 
    } else if (action === 'downgrade') {
      user.role = 'user';
    }
  }

  res.redirect('/admin_panel.html');
});


app.get('/users-data', (req, res) => {
  res.json(users);
});


app.listen(PORT, () => {
  console.log( 'Server running on http://localhost:${PORT}');
});