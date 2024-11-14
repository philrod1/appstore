const axios = require('axios');
require('dotenv').config({ path: '.env' }); // Ensure the path to your .env file is correct

const apiKey = process.env.API_KEY;

module.exports = {

  getJSON: (url, auth, method) => {
    const agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36";
    return axios({
      method: method,
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': agent,
        'Authorization': auth
      }
    })
    .then(response => response.data)
    .catch(error => {
      throw error.response ? error.response.status : error;
    });
  },

  generateImage: async (prompt) => {
    console.log("Prompt: ", prompt);
    console.log("API Key: ", apiKey);
    
    try {
      const requestData = {
        prompt: `an icon for an application called "${prompt}"`,
        n: 1,
        size: "1024x1024",
      };

      console.log("Request Data: ", requestData);

      const response = await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/images/generations',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        data: requestData,
        responseType: 'arraybuffer'
      });

      // Convert the image data to a base64 string
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      console.log("Base64: ", base64Image);
      
      return `data:image/png;base64,${base64Image}`;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = Buffer.from(error.response.data).toString('utf8');
        console.error("Error Response: ", JSON.parse(errorData));
      } else {
        console.error("Error: ", error);
      }
      throw error;
    }
  },

  getRicStatus: async (ric) => {
    try {
      const response = await axios.get(`http://${ric.address}:3000/status`);
      return {
        isAlive: response.data.isAlive,
        isReady: response.data.isReady,
        dmsReady: response.data.dmsReady,
        e2Status: response.data.e2Status
      };
    } catch (error) {
      return {
        isAlive: false,
        isReady: false,
        dmsReady: false,
        e2Status: 'unknown'
      };
    }
  },
  
  getXappStatus: async (ric, xapp) => {
    try {
      const response = await axios.get(`http://${ric.address}:3000/xapp/${xapp.name}/${xapp.version}`);
      return response.data;
    } catch (error) {
      console.error(error);
      return {
        onboarded: false,
        installed: false,
        started: false,
        ready: false
      };
    }
  }

}