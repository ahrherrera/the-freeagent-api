var express = require('express');
var app = express();
const http = require('http');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var server = http.createServer(app);
var cors = require('cors');

var router = express.Router();
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(cors({ origin: '*' }));

// Add headers
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});

router.get('/', function(request, response) {
    response.writeHead(403, { 'Content-Type': 'text/html' });
    response.end('<H1>403<br>Forbidden</H1>');
    //res.redirect('./web.config');
});

router.get('/success', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>200<br>Success</h1>');
});

app.use('/', router);
app.use('/api', router);
app.use('/FreeAgent', router);

app.use(function(req, res, next) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end("<h1>404<br>Not Found</h1>");
});

app.listen(process.env.PORT || 9999, () => console.log("Server stating on http://localhost:9999"));

var postFreeAgent = require("./controllers/FreeAgentUp");
var getFreeAgent = require("./controllers/FreeAgentDown");

router.route("/FreeAgent/login").post(postFreeAgent.login);
router.route("/FreeAgent/register").post(postFreeAgent.registerUser);

router.route("/FreeAgent/getSports").get(getFreeAgent.getSports);
router.route("/FreeAgent/checkUsername").get(getFreeAgent.checkUsername);
router.route("/FreeAgent/getPositions").get(getFreeAgent.getPositions);