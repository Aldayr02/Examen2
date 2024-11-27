const express = require('express');
const routes = require('./routes');
const aws = require('aws-sdk');

const app = express();
const port = 3000;

app.use(express.json());

app.use(routes);

app.listen(port, () => {
  console.log(`App runnning in ${port}`);
});
