const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
// pasrse the request body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//global variables
let usersDb = [];
let exercisesDb = [];

//  API Endpoints

// create a new user
app.post('/api/users', function (req, res) {
  const userName = req.body.username;
  const userId = String(Math.floor(Math.random() * 1000000)); // Generate a random user ID
  usersDb.push({ username: userName, _id: userId });
  res.json({ username: userName, _id: userId });
  console.log(`User created: ${userName} with ID: ${userId}`);
})

// get all users
app.get('/api/users', function (req, res) {
  res.json(usersDb);
  console.log('Users retrieved:', usersDb);
})


// logs all exercises for a use 
app.get('/api/users/:_id/logs/:from?/:to?/:limit?', function (req, res) {
  // check is user exists
  let check = false;
  let userName;
  let userID;
  for (let i = 0; i < usersDb.length; i++) {
    if (usersDb[i]._id === req.params._id) {
      check = true;
      userName = usersDb[i].username
      userID = usersDb[i]._id;
      break;
    }
  }
  if (!check) {
    return res.status(404).json({ "error": "User not found" });
  }

  let check_exerc = false;
  // check if there are exercises for the user
  for (let i = 0; i < exercisesDb.length; i++) {  
    if (exercisesDb[i]._id === userID) {
      check_exerc = true;
      break;
    }
  }
  if (!check_exerc) {
    return res.status(404).json({ "error": "No exercises found for this user" });
  }

  // if there are exercises, filter them by date and limit
  let filteredExercises = exercisesDb.filter(exercise => exercise._id === req.params._id);

  if (req.params.from) {
    const fromDate = new Date(req.params.from);
    if (isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: 'Invalid from date format' });
    }
    if (req.params.to) {
      const toDate = new Date(req.params.to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ error: 'Invalid to date format' });
      }
      filteredExercises = filteredExercises.filter(exercise => toDate >= fromDate);
    }
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) >= fromDate);

    if (req.params.limit) {
      const limit = parseInt(req.params.limit);
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ error: 'Invalid limit' });
      }
      filteredExercises = filteredExercises.slice(0, limit);
    }
  }

  // send response 
  console.log(`Logs retrieved for user ${userName}:`, filteredExercises);
  res.json({_id: req.params._id, username: userName, count: filteredExercises.length, log: filteredExercises });
});


// add an exercise to a user
app.post('/api/users/:_id/exercises', function (req, res) {
  // fisrt check if use is on database 
  if (!usersDb.some(user => user._id === req.params._id)) {
    return res.status(404).json({ error: 'User not found' });
  }
  // check is date is valid
  const date = req.body.date ? new Date(req.body.date) : new Date();
  if (isNaN(date.getTime())) {  
    return res.status(400).json({ error: 'Invalid date format' });
  }
  else {
    const user = usersDb.find(user => user._id === req.params._id);
    const description = req.body.description;
    const duration = parseInt(req.body.duration);

    const exercise = {
      _id: user._id,
      description: description,
      duration: duration,
      date: date.toDateString(),
    }

    response = {
      _id: user._id,
      username: user.username,
      description: description,
      duration: duration,
      date: date.toDateString(),
    }
    // add the exercise to the exercises database
    exercisesDb.push(exercise)

    res.json(response);
    console.log(`Exercise added for user ${user.username}:`, exercise);
  }
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
