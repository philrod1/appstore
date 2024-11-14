const mongoose = require('mongoose');
const { Schema } = mongoose;


const ricSchema = new Schema({
  address:  { type: String, required: true }
});

// Create the model from the schema
const RIC = mongoose.model('RIC', ricSchema);

module.exports = RIC;