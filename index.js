const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongo = require('./mongo')

app.use(cors())
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  const data = await mongo.getData({ username: 1 })
  res.json(data)
});

app.post('/api/users', async (req, res) => {
  if (!req.body.username) {
    res.json({ error: 'username is required' });
    return;
  }

  const data = await mongo.saveData({
    username: req.body.username
  })

  res.json({
    _id: data.insertedId,
    username: req.body.username
  })
});

app.get('/api/users/:_id/logs', async (req, res) => {
  if (!req.params._id) {
    res.json('The user not found');
    return;
  }

  const filter = { _id: mongo.toObjectId(req.params._id) };
  const obj = { log: 1 };

  if (req.query.from) {
    filter['log.date'] = { $gte: req.query.from };
  }

  if (req.query.to) {
    filter['log.date'] = { $lte: req.query.to };
  }

  if (req.query.limit && !isNaN(req.query.limit)) {
    obj.log = { $slice: parseInt(req.query.limit) };
  }

  const data = await mongo.findData(filter, obj);

  res.json({
    count: data?.log ? data.log.length : 0,
    log: data?.log ?? []
  })
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  if (!req.params._id) {
    res.json('The user not found');
    return;
  }

  if (!req.body.description) {
    res.json('The description data invalid');
    return;
  }

  if (!req.body.duration || isNaN(req.body.duration)) {
    res.json('The duration data invalid');
    return;
  }

  if (!req.body.date || !req.body.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    res.json('The date data invalid');
    return;
  }

  const logs = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date
  }

  const data = await mongo.updateData({
    _id: mongo.toObjectId(req.params._id)
  }, {
    $addToSet: { log: logs }
  });

  res.json(data)
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
