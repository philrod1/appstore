const express = require('express');
const router = express.Router();
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const XApp = require('../models/xapp');
const { generateImage } = require('../helper');


router.get('/', async (req, res, next) => {
  try {
    const xApps = await XApp.find({});

    // Extract names and base64 encoded icons
    const xAppData = xApps.map(app => ({
      name: app.name,
      icon: app.icon
    }));

    // Render the view with the extracted data
    res.render('index', { title: 'Store', xApps: xAppData });
  } catch (error) {
    next(error);
  }
});

router.post('/add', async (req, res, next) => {
  const gitUrl = req.body.gitUrl;
  const cloneDir = path.join(__dirname, '../clones', path.basename(gitUrl, '.git'));

  try {
    // Check if the directory exists and is not empty
    if (fs.existsSync(cloneDir) && fs.readdirSync(cloneDir).length > 0) {
      // Remove the existing directory
      fs.rmSync(cloneDir, { recursive: true, force: true });
    }
    // Clone the repository
    await simpleGit().clone(gitUrl, cloneDir);

    // Define possible directories and filenames for the configuration file
    const directories = ['config', 'deploy', 'xapp-descriptor', 'init'];
    const filenames = ['config.json', 'config-file.json'];

    let configFilePath = null;

    // Search for the configuration file
    for (const dir of directories) {
      for (const file of filenames) {
        const filePath = path.join(cloneDir, dir, file);
        if (fs.existsSync(filePath)) {
          configFilePath = filePath;
          break;
        }
      }
      if (configFilePath) break;
    }

    if (!configFilePath) {
      throw new Error('Configuration file not found');
    }

    // Extract information from the found configuration file
    const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

    // Generate the icon image
    const iconPath = path.join(__dirname, '../public/xapp.png');
    const iconBase64 = fs.readFileSync(iconPath, 'base64');

    // Read the README.md file if it exists
    const readmePath = path.join(cloneDir, 'README.md');
    let readmeContent = '';
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf8');
    }

    // Populate the XApp model
    const xApp = new XApp({
      name: configData.name,
      version: configData.version,
      description: configData.description || '',
      gitUrl: gitUrl,
      icon: iconBase64,
      readme: readmeContent
    });

    // Save the XApp instance to the database
    await xApp.save();

    // Clean up: remove the cloned repository
    fs.rmSync(cloneDir, { recursive: true, force: true });

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing the Git URL');
  }
});

module.exports = router;