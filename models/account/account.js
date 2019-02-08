var config = require("../../controllers/mssql/mssqlconnector"),
    sql = require('mssql'),
    jwt = require('jsonwebtoken');

//Module export returning a promise

exports.testConnection = function(req) {
    return new Promise((resolve, reject) => { //return promise, callbacks are bad!

        var conn = config.findConfig();

        sql.connect(conn).then(function() {
            sql.close();
            return resolve('Connection successful');

        }).catch(function(err) {
            sql.close();
            return reject(err);
        })
    });
};

exports.login = function(req) {
    return new Promise((resolve, reject) => { //return promise, callbacks are bad!
        console.log(req.body);
        var conn = config.findConfig();
        var data = {};
        data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
        sql.connect(conn)
            .then(function() {
                var request = new sql.Request();
                request.input('Username', sql.VarChar(50), req.body.Username);
                request.input('Password', sql.VarChar(100), req.body.Password);

                request.execute("[dbo].[sp_Login]").then(function(recordsets) {
                    let rows = recordsets.recordset;
                    var mainKey = rows[0];
                    var selectedKey;
                    for (var key in mainKey) {
                        selectedKey = key;
                    }

                    sql.close();
                    if (mainKey.Status == 0) {
                        data.msg.Code = 400;
                        data.msg.Message = mainKey.Mensaje;
                        return reject(data);

                    } else {
                        jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                            data = {
                                token: token
                            };
                            return resolve(data);
                        });
                    }
                }).catch(function(err) {
                    sql.close();
                    data.msg.Code = 500;
                    data.msg.Message = err.message;
                    return reject(data);
                });
            }).catch(function(err) {
                sql.close();
                data.msg.Code = 400;
                data.msg.Message = err.message;
                return reject(data);
            });
    });
};

exports.registerDevice = function(req) {
    return new Promise((resolve, reject) => {
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
                    return reject(data);
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
                            return resolve(mainKey[selectedKey]);
                        }).catch(function(err) {
                            data.msg.Code = 500;
                            //TODO: EN produccion cambiar mensajes a "Opps! Something ocurred."
                            data.msg.Message = err.message;
                            sql.close();
                            return reject(data);
                        });
                    }).catch(function(err) {
                        data.msg.Code = 500;
                        data.msg.Message = err.message;
                        sql.close();
                        return reject(data);
                    });
                }
            });
        } else {
            // Unauthorized
            data.msg.Code = 400;
            data.msg.Message = "Unauthorized";
            return reject(data);
        }

    });
}


exports.register = function(req) {
    return new Promise((resolve, reject) => { //return promise, callbacks are bad!

        var conn = config.findConfig();
        var data = {};
        data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
        sql.connect(conn).then(function() {
            var request = new sql.Request();
            request.input('FirstName', sql.VarChar(150), req.body.FirstName);
            request.input('LastName', sql.VarChar(150), req.body.LastName);
            request.input('Email', sql.VarChar(100), req.body.Email);
            request.input('phone', sql.VarChar(15), req.body.phone);
            request.input('ServiceID', sql.Int, req.body.serviceID);
            request.input('TypeID', sql.Int, req.body.TypeID);
            request.input('birthday', sql.Date, req.body.birthday);
            request.input('username', sql.VarChar(150), req.body.username);
            request.input('password', sql.VarChar(100), req.body.password);
            request.input('state', sql.VarChar(100), req.body.state);
            request.input('city', sql.VarChar(100), req.body.city);

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
                    sql.close();
                    return reject(data);
                } else {
                    sql.close();
                    jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                        data = {
                            token: token
                        };
                        return resolve(data);
                    });

                }
            }).catch(function(err) {
                data.msg.Code = 500;
                //TODO: EN produccion cambiar mensajes a "Opps! Something ocurred."
                data.msg.Message = err.message;
                sql.close();
                return reject(data);
            });
        }).catch(function(err) {
            data.msg.Code = 500;
            data.msg.Message = err.message;
            sql.close();
            return reject(data);
        });
    });
};

exports.sendLocation = function(req) {
    return new Promise((resolve, reject) => { //return promise, callbacks are bad!

        var conn = config.findConfig();
        var data = {};
        data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            jwt.verify(req.token, 'cKWM5oINGy', (err, authData) => {
                if (err) {
                    data.msg.Code = 400;
                    data.msg.Message = "Unauthorized";
                    return reject(data);
                } else {
                    sql.connect(conn).then(function() {
                        var request = new sql.Request();
                        request.input('profileID', sql.Int, authData.User.Profile.id);
                        request.input('Latitude', sql.Decimal(9, 6), req.body.lat);
                        request.input('Longitude', sql.Decimal(9, 6), req.body.lng);

                        request.execute("[dbo].sp_updateLocation").then(function(recordsets) {
                            sql.close();
                            return resolve(data);
                        }).catch(function(err) {
                            data.msg.Code = 500;
                            //TODO: EN produccion cambiar mensajes a "Opps! Something ocurred."
                            data.msg.Message = err.message;
                            sql.close();
                            return reject(data);
                        });
                    }).catch(function(err) {
                        data.msg.Code = 500;
                        data.msg.Message = err.message;
                        sql.close();
                        return reject(data);
                    });
                }
            });
        } else {
            // Unauthorized
            data.msg.Code = 400;
            data.msg.Message = "Unauthorized";
            return reject(data);
        }

    });
};

exports.checkUsername = function(req) {
    return new Promise((resolve, reject) => { //return promise, callbacks are bad!

        var conn = config.findConfig();
        var data = {};
        data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };

        sql.connect(conn).then(function() {
            var request = new sql.Request();
            request.input('Username', sql.VarChar(50), req.query.Username);
            request.input('Email', sql.VarChar(50), req.query.Email);
            request.execute("[dbo].sp_checkUsername").then(function(recordsets) {
                let rows = recordsets.recordset;
                sql.close();
                return resolve(rows[0]);
            }).catch(function(err) {
                sql.close();
                data.msg.Code = 500;
                data.msg.Message = err.message;
                return reject(data);
            });
        }).catch(function(err) {
            sql.close();
            data.msg.Code = 500;
            data.msg.Message = err.message;
            return reject(data);
        });
    });
};

exports.updateUser = function(req) {
    return new Promise((resolve, reject) => {

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
                    return reject(data);
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
                            request.input('picUrl', sql.VarChar(500), req.file.destination + "/" + req.file.filename);
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
                                sql.close();
                                return reject(data);
                            } else {
                                jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                                    data = {
                                        token: token
                                    };
                                    return resolve(data);
                                });
                                sql.close();
                            }
                        }).catch(function(err) {
                            data.msg.Code = 500;
                            //TODO: EN produccion cambiar mensajes a "Opps! Something ocurred."
                            data.msg.Message = err.message;
                            sql.close();
                            return reject(data);
                        });
                    }).catch(function(err) {
                        data.msg.Code = 500;
                        data.msg.Message = err.message;
                        sql.close();
                        return reject(data);
                    });
                }
            });
        } else {
            // Unauthorized
            data.msg.Code = 400;
            data.msg.Message = "Unauthorized";
            return reject(data);
        }

    });
}