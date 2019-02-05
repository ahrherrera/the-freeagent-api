var config = require("../../controllers/mssql/mssqlconnector"),
    sql = require('mssql'),
    jwt = require('jsonwebtoken');

exports.getInvitations = function(req) {
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
                        request.input('ProfileID', sql.Int, authData.User.Profile.id);

                        request.execute("dbo.sp_getInvitations").then(function(recordsets) {
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

exports.getSentInvitations = function(req) {
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
                        request.input('ProfileID', sql.Int, authData.User.Profile.id);

                        request.execute("dbo.sp_getSentInvitations").then(function(recordsets) {
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

exports.invite = function(req) {
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
                        request.input('SearchID', sql.Int, req.body.searchID);

                        request.execute("dbo.sp_Invite").then(function(recordsets) {
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

exports.confirm = function(req) {
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
                            return resolve(mainKey[selectedKey])
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