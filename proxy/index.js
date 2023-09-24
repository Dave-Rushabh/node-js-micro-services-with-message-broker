const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/contact', proxy('http://localhost:8001'));
app.use('/api/user', proxy('http://localhost:8002'));

app.listen(8000, () => {
  console.log('API proxy is listening on port 8000');
});
