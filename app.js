const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const mongoose = require('mongoose');
const index = require('./routes/index'); // Adjust the path as necessary
const { mongoURI } = require('./config');

const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB connected');

    // Clear out all objects from the collections
    // const collections = await mongoose.connection.db.collections();
    // for (let collection of collections) {
    //   await collection.deleteMany({});
    // }
    // console.log('All collections cleared');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/', index);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
app.listen(port, () => {
  console.log(`App running on http://0.0.0.0:${port}`);
});

module.exports = app;