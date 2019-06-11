const express = require('express');
import models, {connectDb} from './models/index';

const app = express();
const PORT = 5000;

app.get('/api/things', (req, res) => {
  const things = [
    {id: 1, name: 'device_1', mac: '1c:sd:12:ds:sa'},
    {id: 2, name: 'device_2', mac: '1c:sd:12:ds:sb'},
    {id: 3, name: 'device_3', mac: '1c:sd:12:ds:sc'},
  ]
  res.json(things);
});


connectDb().then( async () => {
  app.listen(PORT, () =>
    console.log(`Mainflux admin server listening on port ${PORT}!`),
  );
});
