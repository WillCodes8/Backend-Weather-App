require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const getWeather = require('./utils/weatherLogic');

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

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up Page' });
});

app.get('/private', (req, res) => {
  res.render('private', { title: 'Premium Weather Page' });
});

app.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'lat and lon must be valid numbers' });
  }

  try {
    const data = await getWeather(lat, lon); 
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});