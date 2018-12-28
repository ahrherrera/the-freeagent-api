var config = require("../connections/FreeAgentConnection.js"),
    sql = require('mssql'),
    publish = require('../publisher.js'),
    jwt = require('jsonwebtoken')

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
                    if (mainKey.Mensaje == "Usuario/Contraseña incorrecta") {
                        data.msg.Code = 400;
                        data.msg.Message = mainKey.Mensaje;
                        publish.publisher(res, data);
                        sql.close();
                    } else {
                        jwt.sign(JSON.parse(mainKey[selectedKey]), 'cKWM5oINGy', (err, token) => {
                            data = {
                                token: token
                            }
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
                    }
                    publish.publisher(res, data);
                });
                sql.close();
            }
        });
    }).catch(function() {
        data.msg.Code = 500;
        data.msg.Message = err.message;
        publish.publisher(res, data);
        sql.close();
    });
}