const express = require('express');
const router = express.Router();
const XApp = require('../models/xapp');

router.get('/', async (req, res, next) => {
  try {
    const xApps = await XApp.find({});

    // Extract names and base64 encoded icons
    const xAppData = xApps.map(app => ({
      name: app.name,
      version: app.version,
      icon: app.icon
    }));

    // Render the view with the extracted data
    res.render('index', { title: 'Store', xApps: xAppData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;