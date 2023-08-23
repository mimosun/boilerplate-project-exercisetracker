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
  const data = await mongo.getData({}, { username: 1 })
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

  if (!data || !data.insertedId) {
    res.json({ error: 'error when create user' });
    return;
  }

  res.json({
    _id: data.insertedId,
    username: req.body.username
  })
});

app.get('/api/users/:_id/logs', async (req, res) => {
  if (!req.params._id) {
    res.json('Param not found');
    return;
  }

  const id = mongo.toObjectId(req.params._id);

  if (!id) {
    res.json('The id invalid');
    return;
  }

  const filter = { _id: id };
  const obj = { exercise: 1 };

  if (req.query.from) {
    filter['exercise.date'] = { $gte: new Date(req.query.from).toDateString() };
  }

  if (req.query.to) {
    filter['exercise.date'] = { $lte: new Date(req.query.to).toDateString() };
  }

  if (req.query.limit && !isNaN(req.query.limit)) {
    obj.exercise = { $slice: parseInt(req.query.limit) };
  }

  const data = await mongo.findData(filter, obj);

  res.json({
    count: data?.exercise ? data.exercise.length : 0,
    log: data?.exercise ?? []
  })
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  if (!req.params._id) {
    res.json('Param not found');
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

  if (req.body.date && !req.body.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    res.json('The date data invalid');
    return;
  }

  const date = req.body?.date ? new Date(req.body.date) : new Date();

  const exercises = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: date.toDateString()
  }

  const id = mongo.toObjectId(req.params._id);

  if (!id) {
    res.json('The id invalid');
    return;
  }

  await mongo.updateData({ _id: id }, {
    $addToSet: { exercise: exercises }
  });

  const data = await mongo.getData({ _id: id });
  exercises._id = data[0]._id;
  exercises.username = data[0].username;
  res.json(exercises);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
