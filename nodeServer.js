// Load Amazon RDS credentials from .env file
require('dotenv').config()

var express  = require('express')
var session  = require('express-session')
var cors     = require('cors')
var app      = express()
var morgan   = require('morgan')
var port     = process.env.PORT ? process.env.PORT : 3000   // NOTE: Port 80 can be forwarded to 3000 on our ec2 instance
var db       = require('./db') // Database                   // this command: sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
var bodyParser        = require('body-parser')
var DynamoDBStore     = require('dynamodb-store')

// Allow cross-origin resource sharing
app.use(cors())

// log every request to the console
app.use(morgan('dev'))

// Parse post bodies
app.use(bodyParser.json()) // get information from JSON POST bodies

// Set up session store
var storeOptions = {
  'dynamoConfig': {
    'accessKeyId': process.env.AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
    'region': 'us-west-2',
    'endpoint': 'http://dynamodb.us-west-2.amazonaws.com',
    'dynamodb_store_debug': true
  },
  'keepExpired': false,
  'touchInterval': 30000,
  'ttl': 600000,
}

// Set up user sessions
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new DynamoDBStore(storeOptions)
}))

// User Authentication
app.use('/auth',require('./controllers/auth.js'))

// Carbon-Calculator Application
app.use('/carbon',require('./controllers/carbon.js'))

//-------------------------------
var httpreq = require('httpreq')
db.initialize()

// User initiates login
router.get('/login/:returnURI', function (req, res) {
  // Update session
  req.session.returnURI = req.params.returnURI
  console.log(req.session)

  // Redirect user to login url with application url
	res.redirect('https://login.oregonstate.edu/idp/profile/cas/login?service=' + process.env.CAS_APPLICATION_URL)
})

// User logs in successfully and is redirected back to this route
router.get('/energy', function (req, res) {

  // Complete login handshake
  httpreq.get('http://login.oregonstate.edu/idp/profile/cas/serviceValidate?ticket=' + req.query.ticket + '&service=' + process.env.CAS_APPLICATION_URL, function (err, result) {
    if (err) return console.log(err)
    console.log(result.body)
    res.send("done")
  })

})

//------------------------

// Connect to DB
db.connect(function (err, connection) {
  if (err) {
    throw err
  }
  // Start the server
  app.listen(port, function () {
    console.log('Server listening on port:', port)
  })
})
