require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const getWeather = require('./utils/weatherLogic');
const requireLogin = require('./middleware/authMiddleware');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

app.get('/private', requireLogin, async (req, res) => {
  
  const userId = req.session.userId;
  const query = 'SELECT lat, lon FROM favorites WHERE user_id = $1';
  const result = await pool.query(query, [userId]);

  const coordinates = result.rows;
  const weatherData = [];

  for (const entry of coordinates) {
    const { lat, lon } = entry;
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,cloudcover,wind_speed_10m`);
    const data = await response.json();
    weatherData.push({ lat, lon, data });
  }
  const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
  const username = userResult.rows[0]?.username || 'User';


  res.render('private', { weatherData, username });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/'); 
    });
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

const bcrypt = require('bcrypt'); 
const pool = require('./db');

app.post('/signup', async (req, res) => {
    const {name, username, password} = req.body
    try{
        const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).send('Username already taken. Please choose another.');
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        await pool.query(
            'INSERT INTO users (name, username, password) VALUES ($1, $2, $3)',
            [name, username, hashedPassword]
        )

        res.redirect('/login');
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).send('Sign Up Failed Error: 500')
    }
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body

    try{
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])

        if(result.rows.length === 0){
            return res.status(400).send('Invaild Username or Password, Please Try Again')
        }

        const user = result.rows[0]

        const validPassword = await bcrypt.compare(password, user.password)

        if(!validPassword) {
            return res.status(400).send('Invaild Username or Password, Please Try Again')
        }

        req.session.userId = user.id

        res.redirect('/private');

    } catch (err) {
        console.error(err)
        res.status(500).send('Login Failed')
    }
})

app.post('/favorites', requireLogin, async (req, res) => {
    console.log('User ID from session:', req.session.userId);
    console.log('Request body:', req.body);
    
    const { lat, lon } = req.body;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
        return res.status(400).send('Valid latitude and longitude required');
    }

    try {
        await pool.query(
            'INSERT INTO favorites (user_id, lat, lon) VALUES ($1, $2, $3)',
            [req.session.userId, latNum, lonNum]
        );
        res.status(201).send('Favorite saved');
    } catch (err) {
      console.error('Error inserting into favorites:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
        console.error('Error inserting into favorites:', err);
        res.status(500).send('Server error');
    }
});

app.get('/favorites', async (req, res) => {
  try {

    const userId = req.session.userId; 
    const query = 'SELECT lat, lon FROM favorites WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    const username = userResult.rows[0]?.username || 'User';

    const coordinates = result.rows;

    const weatherData = [];

    for (const entry of coordinates) {
      const { lat, lon } = entry;
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,cloudcover,wind_speed_10m`);
      const data = await response.json();
      weatherData.push({ lat, lon, data });
    }

    console.log("Weather data being rendered:", weatherData);
    res.render('favorites', { weatherData, username });

  } catch (error) {
    console.error("Error loading favorites:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete('/favorites', requireLogin, async (req, res) => {
  const { lat, lon } = req.body;
  const userId = req.session.userId;

  if (!lat || !lon) {
    return res.status(400).send('Latitude and longitude required');
  }

  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND lat = $2 AND lon = $3',
      [userId, lat, lon]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Favorite not found');
    }

    res.status(200).send('Favorite deleted');

  } catch (err) {
    console.error('Error deleting favorite:', err);
    res.status(500).send('Failed to delete favorite');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});