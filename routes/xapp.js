const express = require('express');
const router = express.Router();
const XApp = require('../models/xapp');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

router.get('/:name/:version', async (req, res, next) => {
  try {
    const xApp = await XApp.findOne({ name: req.params.name, version: req.params.version });
    
    if (!xApp) {
      return res.status(404).send('XApp not found');
    }

    // Render the README content as HTML
    const readmeHtml = md.render(xApp.readme);

    res.render('xapp', { xapp: xApp, readmeHtml: readmeHtml });
  } catch (error) {
    next(error);
  }
});



module.exports = router;