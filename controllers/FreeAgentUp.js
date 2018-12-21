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

                req.execute("[userE2FreeAgent].[sp_Login]").then(function(recordsets) {
                    let rows = recordsets.recordset;
                    var mainKey = rows[0];
                    var selectedKey;
                    for (var key in mainKey) {
                        selectedKey = key;
                    }
                    if (mainKey.Mensaje == "Usuario/Contraseña incorrecta") {
                        data.msg.Code = 400;
                        data.msg.Message = 'Not logged in!';
                        res.statusCode = 400;
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
                    data.msg.Message = err.Message;
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
        data.Message = "Sin Body";
        publish.publisher(res, data);
    }
};