//server.js
'use strict'

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Comment = require('./model/comments');
var secrets = require('./secrets');

//instances
var app = express();
var router = express.Router();

//set port
var port = process.env.API_PORT || 3001;

//db config - URI from secrets.js
var mongoDB = secrets.requestSecret('db_uri');
mongoose.connect(mongoDB)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');

  //remove caching
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//initialize API
router.get('/', function(req, res) {
  res.json({ message: 'API Initialized!'});
});

//add a new route
router.route('/comments')
  //retrieve from db
  .get(function(req, res) {
    //looks at Comment Schema
    Comment.find(function(err, comments) {
      if (err)
        res.send(err);
      //responds with  json object of db comments.
      res.json(comments)
    });
  })
  //post new comment to db
  .post(function(req, res) {
    var comment = new Comment();
    (req.body.author) ? comment.author = req.body.author : null;
    (req.body.text) ? comment.text = req.body.text : null;

    comment.save(function(err) {
      if (err)
        res.send(err);
      res.json({ message: 'Comment successfully added!' });
    });
  });

//Adding a route search using ID
router.route('/comments/:comment_id')
  //Update comment after search using id
  .put(function(req, res) {
    Comment.findById(req.params.comment_id, function(err, comment) {
      if (err)
        res.send(err);
      //checks if any changes were made, if so it updates
      (req.body.author) ? comment.author = req.body.author : null;
      (req.body.text) ? comment.text = req.body.text : null;
      //save comment
      comment.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Comment has been updated' });
      });
    });
  })
  //remove comment from db
  .delete(function(req, res) {
    //delete after search using id
    Comment.remove({ _id: req.params.comment_id }, function(err, comment) {
      if (err)
        res.send(err);
      res.json({ message: 'Comment has been deleted' })
    })
  });


  router.get('/names/:nameIds', (req, res) => {
    const nameIds = req.params.nameIds.split(',').map(mongoose.Types.ObjectId);
    let names = {};
    db.collection('names').find({ _id: { $in: nameIds }})
       .each((err, name) => {
         //assert.equal(null, err);
  
         if (!name) { // no more names
           res.send({ names });
           return;
         }
  
         names[name._id] = name;
       });
  });
  
  router.get('/contests/:contestId', (req, res) => {
    db.collection('contests')
       .findOne({ _id: mongoose.Types.ObjectId(req.params.contestId) })
       .then(contest => res.send(contest))
       .catch(error => {
         console.error(error);
         res.status(404).send('Bad Request');
       });
  });

//Specify router configured for {host):{port}/api/anyroutehere
app.use('/api', router);

//starts server and listens for requests
app.listen(port, function() {
  console.log(`api running on port ${port}`);
});
