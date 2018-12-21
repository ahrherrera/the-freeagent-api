var fs = require("fs"),
    json;

function getPath(file) {
    var path = __dirname + '/' + file;

    return path;
}

function getConnection() {
    var data = fs.readFileSync(getPath('../configuration/connectionsConfig.json'), 'utf8');
    json_file = JSON.parse(data);

    var conn = {};
    conn = json_file[0].freeAgent;
    return conn;
}


//Connection to DB
exports.findConfig = function() {
    //get COnfig	
    return getConnection();
};