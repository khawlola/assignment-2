const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// إعدادات الجلسة
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

// تقديم الملفات الثابتة من مجلد 'pages'
app.use(express.static(path.join(__dirname, 'pages')));

// مستخدمين وهميين
const users = [
  { username: 'administrator', password: 'admin', role: 'admin' },
  { username: 'amiwla', password: 'ami123', role: 'user' }
];

// عرض صفحة تسجيل الدخول
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

// التحقق من تسجيل الدخول
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

// عرض بيانات صفحة الترحيب
app.get('/welcome-data', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  res.json({
    username: req.session.user.username,
    role: req.session.user.role
  });
});

// معالجة الترقية أو التنزيل من صفحة الإدارة
app.post('/admin_panel', (req, res) => {
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
// إرجاع جميع المستخدمين مع أدوارهم لعرضهم في admin panel
app.get('/users-data', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  res.json(users);
});

// بدء الخادم
app.listen(3000, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

