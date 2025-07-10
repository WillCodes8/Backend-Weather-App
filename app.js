require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Backend Weather Tracker App' });
});

app.get('/public', (req, res) => {
  res.render('public', { title: 'Public Weather Page' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});