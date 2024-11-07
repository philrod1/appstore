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

// Define methods for the schema
xAppSchema.methods.getSummary = function() {
  return `${this.name} (v${this.version}): ${this.description}`;
};

xAppSchema.methods.updateVersion = function(newVersion) {
  this.version = newVersion;
  return this.save();
};

// Create the model from the schema
const XApp = mongoose.model('XApp', xAppSchema);

module.exports = XApp;