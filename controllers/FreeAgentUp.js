var config = require("../connections/FreeAgentConnection.js"),
    sql = require('mssql'),
    publish = require('../publisher.js'),
    jwt = require('jsonwebtoken'),
    admin = require("firebase-admin"),
    serviceAccount = require("../iglesiatechapp-firebase.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://iglesiatechapp.firebaseio.com"
});

exports.login = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    var username = req.body.Username;
    var pw = req.body.Password;

    if (req.body != {}) {
        sql.connect(conn)
            .then(function() {
                var req = new sql.Request();
                req.input('Username', sql.VarChar(50), username);
                req.input('Password', sql.VarChar(100), pw);

                req.execute("[dbo].[sp_Login]").then(function(recordsets) {
                    let rows = recordsets.recordset;
                    var mainKey = rows[0];
                    var selectedKey;
                    for (var key in mainKey) {
                        selectedKey = key;
                    }
                    if (mainKey.Status == 0) {
                        data.msg.Code = 400;
                        data.msg.Message = mainKey.Mensaje;
                        publish.publisher(res, data);
                        sql.close();
                    } else {
                        jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                            data = {
                                token: token
                            };
                            publish.publisher(res, data);
                        });
                        sql.close();
                    }
                }).catch(function(err) {
                    data.msg.Code = 500;
                    data.msg.Message = err.message;
                    publish.publisher(res, data);
                    sql.close();
                });
            }).catch(function(err) {
                data.msg.Code = 400;
                data.msg.Message = err.message;
                publish.publisher(res, data);
                sql.close();
            });
    } else {
        data.msg.Code = 500;
        data.msg.Message = "Sin Body";
        publish.publisher(res, data);
    }
};

exports.sendLocation = function(req, res) {
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
                    request.input('profileID', sql.Int, authData.User.Profile.id);
                    request.input('Latitude', sql.Decimal(9, 6), req.body.lat);
                    request.input('Longitude', sql.Decimal(9, 6), req.body.lng);

                    request.execute("[dbo].sp_updateLocation").then(function(recordsets) {
                        sql.close();
                        publish.publisher(res, data);
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

}

exports.registerUser = function(req, res) {
    var data = {};
    data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
    var conn = config.findConfig();

    sql.connect(conn).then(function() {
        var request = new sql.Request();
        request.input('FirstName', sql.VarChar(150), req.body.FirstName);
        request.input('LastName', sql.VarChar(150), req.body.LastName);
        request.input('Email', sql.VarChar(100), req.body.Email);
        request.input('phone', sql.VarChar(15), req.body.phone);
        request.input('sportID', sql.Int, req.body.SportID);
        request.input('birthday', sql.Date, req.body.birthday);
        request.input('gender', sql.Int, req.body.gender);
        request.input('username', sql.VarChar(150), req.body.username);
        request.input('password', sql.VarChar(100), req.body.password);
        request.input('bio', sql.VarChar(500), req.body.bio);
        request.input('state', sql.VarChar(100), req.body.state);
        request.input('city', sql.VarChar(100), req.body.city);
        request.input('skill', sql.Int, req.body.skill);
        request.input('Positions', sql.VarChar(sql.MAX), req.body.Positions);

        request.execute("[dbo].sp_CreateUser").then(function(recordsets) {
            let rows = recordsets.recordset;
            var mainKey = rows[0];
            var selectedKey;
            for (var key in mainKey) {
                selectedKey = key;
            }
            if (mainKey.message == "Username already exists") {
                data.msg.Code = 400;
                data.msg.Message = mainKey.message;
                publish.publisher(res, data);
                sql.close();
            } else {
                jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                    data = {
                        token: token
                    };
                    publish.publisher(res, data);
                });
                sql.close();
            }
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
};

exports.updateUser = function(req, res) {
    console.log(req.file);
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
                    request.input('ProfileID', sql.Int, req.body.profileID);
                    request.input('userID', sql.Int, req.body.userID);
                    request.input('FirstName', sql.VarChar(150), req.body.FirstName);
                    request.input('LastName', sql.VarChar(150), req.body.LastName);
                    request.input('Email', sql.VarChar(100), req.body.Email);
                    request.input('phone', sql.VarChar(15), req.body.phone);
                    request.input('sportID', sql.Int, req.body.SportID);
                    request.input('birthday', sql.Date, req.body.birthday);
                    request.input('gender', sql.Int, req.body.gender);
                    request.input('bio', sql.VarChar(500), req.body.bio);
                    request.input('state', sql.VarChar(100), req.body.state);
                    request.input('city', sql.VarChar(100), req.body.city);
                    request.input('skill', sql.Int, req.body.skill);
                    request.input('Positions', sql.VarChar(sql.MAX), req.body.Positions);
                    if (req.file) {
                        request.input('picUrl', sql.VarChar(500), req.file.destination + req.file.filename);
                    } else {
                        request.input('picUrl', sql.VarChar(500), 'n/a');
                    }

                    request.execute("[dbo].sp_UpdateUser").then(function(recordsets) {
                        let rows = recordsets.recordset;
                        var mainKey = rows[0];
                        var selectedKey;
                        for (var key in mainKey) {
                            selectedKey = key;
                        }
                        if (mainKey.message == "Username already exists") {
                            data.msg.Code = 400;
                            data.msg.Message = mainKey.message;
                            publish.publisher(res, data);
                            sql.close();
                        } else {
                            jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                                data = {
                                    token: token
                                };
                                publish.publisher(res, data);
                            });
                            sql.close();
                        }
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

exports.search = function(req, res) {
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
                    request.input('profile_id', sql.Int, authData.User.Profile.id);
                    request.input('PositionID', sql.Int, req.body.positionID);
                    request.input('SportID', sql.Int, req.body.sportID);
                    request.input('gender', sql.Int, req.body.gender);
                    request.input('distance', sql.Int, req.body.distance);

                    request.execute("[dbo].sp_Search").then(function(recordsets) {
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
}

exports.invite = function(req, res) {
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
                    request.input('ProfileID', sql.Int, req.body.profileID);
                    request.input('SearchID', sql.Int, req.body.searchID);

                    request.execute("dbo.sp_Invite").then(function(recordsets) {
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
}

exports.confirm = function(req, res) {
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
                    request.input('invitationID', sql.Int, req.body.invitationID);
                    request.input('status', sql.Int, req.body.status);

                    request.execute("dbo.sp_Confirm").then(function(recordsets) {
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
}

exports.registerDevice = function(req, res) {
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
                    request.input('ProfileID', sql.Int, req.body.profileID);
                    request.input('registrationID', sql.Int, req.body.registrationID);

                    request.execute("dbo.sp_registerDevice").then(function(recordsets) {
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
}