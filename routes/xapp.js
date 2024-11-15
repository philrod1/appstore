const express = require('express');
const router = express.Router();
const XApp = require('../models/xapp');
const RIC = require('../models/ric');
const axios = require('axios');
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

router.get('/restart/:ric/:deployment', async (req, res, next) => {
  try {
    const ric = await RIC.findById(req.params.ric);
    await axios.get(`http://${ric.address}:3000/restart/ricxapp/${req.params.deployment}`);
    res.redirect(`/ric/${req.params.ric}`);
  } catch (error) {
    next(error);
  }
});

router.get('/undeploy/:ric/:xapp', async (req, res, next) => {
  try {
    const ric = await RIC.findById(req.params.ric);
    await axios.post(`http://${ric.address}:3000/undeploy`, { xapp: req.params.xapp });
    res.redirect(`/ric/${req.params.ric}`);
  } catch (error) {
    next(error);
  }
});


module.exports = router;