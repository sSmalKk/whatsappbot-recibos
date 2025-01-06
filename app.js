// app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
global.__basedir = __dirname;
const whatsappRoutes = require('./routes/services/whatsappRoutes'); // Adjust the path if needed

const app = express();
const httpServer = require('http').createServer(app);
const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

// **Place body-parsing middleware before any routes or other middleware**
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false })); // Parses URL-encoded bodies

// Now set up your routes and middleware that depend on req.body

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// All routes
const routes = require('./routes');


app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);

// Swagger Documentation (omitted for brevity)

app.get('/', (req, res) => {
  res.render('index');
});

if (process.env.NODE_ENV !== 'test') {
 
  httpServer.listen(process.env.PORT, () => {
    console.log(`Your application is running on ${process.env.PORT}`);
  });
} else {
  module.exports = app;
}
