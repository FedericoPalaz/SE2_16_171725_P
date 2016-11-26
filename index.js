//index.js, stuff to do on server start

//dependencies

var express = require('express');//express library
var path = require('path');//for pathing stuff
var util = require('util');//to inspect stuff
var url = require('url');//parse url
var bodyParser = require('body-parser');//to parse stuff


//creating instance
var app = express();

//setting port
app.set('port', (process.env.PORT || 1337));

//setting parsers for urls and json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//starting to listen on port
app.listen(app.get('port'), function() {
  console.log('app is up on port', app.get('port'));
});



