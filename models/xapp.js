const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for XApp
const xAppSchema = new Schema({
  name:        { type: String, required: true  },
  version:     { type: String, required: true  },
  description: { type: String, required: false },
  gitUrl:      { type: String, required: true  },
  icon:        { type: String, required: true  },
  readme:      { type: String, required: true  } 
});

// Create the model from the schema
const XApp = mongoose.model('XApp', xAppSchema);

module.exports = XApp;