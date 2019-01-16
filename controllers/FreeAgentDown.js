var config = require("../connections/FreeAgentConnection.js"),
    sql = require('mssql'),
    publish = require('../publisher.js'),
    jwt = require('jsonwebtoken');

exports.getSports = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    sql.connect(conn).then(function() {
        var request = new sql.Request();

        request.execute("[dbo].sp_getSports").then(function(recordsets) {
            let rows = recordsets.recordset;
            var mainKey = rows[0];
            var selectedKey;
            for (var key in mainKey) {
                selectedKey = key;
            }
            var records = mainKey[selectedKey];
            sql.close();
            publish.publisher(res, records);

        }).catch(function(err) {
            data.msg.Code = 500;
            data.msg.Message = err.message;
            sql.close();
            publish.publisher(res, data);

        });
    }).catch(function(err) {
        data.msg.Code = 500;
        data.msg.Message = err.message;
        sql.close();
        publish.publisher(res, data);
    });
}

exports.checkUsername = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    sql.connect(conn).then(function() {
        var request = new sql.Request();
        request.input('Username', sql.VarChar(50), req.query.Username);
        request.input('Email', sql.VarChar(50), req.query.Email);
        request.execute("[dbo].checkUsername").then(function(recordsets) {
            let rows = recordsets.recordset;
            publish.publisher(res, rows[0]);
            sql.close();
        }).catch(function(err) {
            sql.close();
            data.msg.Code = 500;
            data.msg.Message = err.message;
            publish.publisher(res, data);
        });
    }).catch(function(err) {
        sql.close();
        data.msg.Code = 500;
        data.msg.Message = err.message;
        publish.publisher(res, data);
    });
}

exports.getPositions = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    sql.connect(conn).then(function() {
        var request = new sql.Request();
        request.input('SportID', sql.Int, req.query.SportID);
        request.execute("[dbo].getPositions").then(function(recordsets) {
            let rows = recordsets.recordset;
            var mainKey = rows[0];
            var selectedKey;
            for (var key in mainKey) {
                selectedKey = key;
            }
            sql.close();
            publish.publisher(res, mainKey[selectedKey]);
        }).catch(function(err) {
            sql.close();
            data.msg.Code = 500;
            data.msg.Message = err.message;
            publish.publisher(res, data);
        });
    }).catch(function(err) {
        sql.close();
        data.msg.Code = 500;
        data.msg.Message = err.message;
        publish.publisher(res, data);
    });
};

exports.getInvitations = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'cKWM5oINGy', (err, authData) => {
            if (err) {
                data.msg.Code = 400;
                data.msg.Message = "Unauthorized";
                publish.publisher(res, data);
            } else {
                sql.connect(conn).then(function() {
                    var request = new sql.Request();
                    request.input('ProfileID', sql.Int, authData.User.Profile.id);

                    request.execute("dbo.getInvitations").then(function(recordsets) {
                        let rows = recordsets.recordset;
                        var mainKey = rows[0];
                        var selectedKey;
                        for (var key in mainKey) {
                            selectedKey = key;
                        }
                        sql.close();
                        publish.publisher(res, mainKey[selectedKey]);
                    }).catch(function(err) {
                        data.msg.Code = 500;
                        //TODO: EN produccion cambiar mensajes a "Opps! Something ocurred."
                        data.msg.Message = err.message;
                        publish.publisher(res, data);
                        sql.close();
                    });
                }).catch(function(err) {
                    data.msg.Code = 500;
                    data.msg.Message = err.message;
                    publish.publisher(res, data);
                    sql.close();
                });
            }
        });
    } else {
        // Unauthorized
        data.msg.Code = 400;
        data.msg.Message = "Unauthorized";
        publish.publisher(res, data);
    }
};

exports.getSentInvitations = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'cKWM5oINGy', (err, authData) => {
            if (err) {
                data.msg.Code = 400;
                data.msg.Message = "Unauthorized";
                publish.publisher(res, data);
            } else {
                sql.connect(conn).then(function() {
                    var request = new sql.Request();
                    request.input('ProfileID', sql.Int, authData.User.Profile.id);

                    request.execute("dbo.getSentInvitations").then(function(recordsets) {
                        let rows = recordsets.recordset;
                        var mainKey = rows[0];
                        var selectedKey;
                        for (var key in mainKey) {
                            selectedKey = key;
                        }
                        sql.close();
                        publish.publisher(res, mainKey[selectedKey]);
                    }).catch(function(err) {
                        data.msg.Code = 500;
                        //TODO: EN produccion cambiar mensajes a "Opps! Something ocurred."
                        data.msg.Message = err.message;
                        publish.publisher(res, data);
                        sql.close();
                    });
                }).catch(function(err) {
                    data.msg.Code = 500;
                    data.msg.Message = err.message;
                    publish.publisher(res, data);
                    sql.close();
                });
            }
        });
    } else {
        // Unauthorized
        data.msg.Code = 400;
        data.msg.Message = "Unauthorized";
        publish.publisher(res, data);
    }
};