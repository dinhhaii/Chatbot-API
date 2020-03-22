const express = require ('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const constant = require('./utils/constant');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(constant.CONNECTION_STRING, { useNewUrlParser: true,
                        useUnifiedTopology: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("Cafocc MongoDB connection established successfully");
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
