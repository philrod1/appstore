const express = require('express');
const router = express.Router();
const RIC = require('../models/ric');
const XApp = require('../models/xapp');
const axios = require('axios');
const { getRicStatus, getXappStatus } = require('../helper');

// Get all rics
router.get('/', async (req, res, next) => {
  try {
    const rics = await RIC.find();
    for (const ric of rics) {
      ric.status = await getRicStatus(ric);
    }
    res.render('rics', { rics });
  } catch (error) {
    next(error);
  }
});

// Get a specific ric by ID
router.get('/:id', async (req, res, next) => {
  try {
    const ric = await RIC.findById(req.params.id);
    if (!ric) {
      return res.status(404).send('RIC not found');
    }
    ric.status = await getRicStatus(ric);

    // Query the real RIC for the list of XApps and their statuses
    const response = await axios.get(`http://${ric.address}:8090/api/charts`);
    const chartsData = response.data;

    // Extract XApp information from the chartsData
    const xapps = [];
    for (const key in chartsData) {
      if (chartsData.hasOwnProperty(key)) {
        const xappInfo = chartsData[key][0];
        const xapp = await XApp.findOne({ name: xappInfo.name, version: xappInfo.version });
        if (xapp) {
          const status = await getXappStatus(ric, xapp);
          xapps.push({
            ...xapp.toObject(),
            onboarded: status.onboarded,
            installed: status.installed,
            started: status.started,
            ready: status.ready,
            deployment: status.deployment
          });
        }
      }
    }

    // Fetch all available XApps
    const allXApps = await XApp.find();

    // Filter out XApps that are already associated with the RIC
    const associatedXAppIds = xapps.map(xapp => xapp._id.toString());
    const availableXApps = allXApps.filter(xapp => !associatedXAppIds.includes(xapp._id.toString()));

    res.render('ric', { ric, xapps, availableXApps });
  } catch (error) {
    next(error);
  }
});

// Create a new ric
router.post('/add', async (req, res) => {
  const ricIp = req.body['ric-ip'];
  const ipRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  if (!ipRegex.test(ricIp)) {
    return res.status(400).send('Invalid IP address');
  }

  const newRic = new RIC({ address: ricIp, name: `RIC-${ricIp}` });
  await newRic.save();
  res.redirect('/ric');
});

// Update a ric by ID
router.put('/:id', (req, res) => {
  res.send(`Update ric with ID ${req.params.id}`);
});

// Delete a ric by ID
router.get('/delete/:id', (req, res) => {
  res.send(`Delete ric with ID ${req.params.id}`);
});

// Add an xapp to a ric
router.post('/:id/add-xapp', async (req, res, next) => {
  try {
    const { xappId } = req.body;
    const ric = await RIC.findById(req.params.id);
    if (!ric) {
      return res.status(404).send('RIC not found');
    }
    const xapp = await XApp.findById(xappId);
    if (!xapp) {
      return res.status(404).send('XApp not found');
    }
    await axios.post(`http://${ric.address}:3000/deploy`, {
      "git-url": xapp.gitUrl
    });
    res.redirect(`/ric/${ric._id}`);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/:deployment/:xapp', async (req, res, next) => {
  try {
    const ric = await RIC.findById(req.params.id);
    if (!ric) {
      return res.status(404).send('RIC not found');
    }
    const url = `http://${ric.address}:3000/description`;
    const payload = {
      dep: req.params.deployment,
      ns: 'ricxapp'
    };
    const data = await axios.post(url, payload);
    const appLabelLine = data.data.split('\n').find(line => line.startsWith('Labels:'));
    const appLabel = appLabelLine ? appLabelLine.split('=')[1].trim() : 'N/A';
    res.render('deployment', { description: data.data, ric: ric, deployment: appLabel, xapp: req.params.xapp });
  } catch (error) {
    next(error);
  }
});

module.exports = router;