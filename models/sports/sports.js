var config = require("../../controllers/mssql/mssqlconnector"),
    sql = require('mssql'),
    jwt = require('jsonwebtoken');

exports.getSports = function() {
    return new Promise((resolve, reject) => {
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
                return resolve(records);

            }).catch(function(err) {
                data.msg.Code = 500;
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
}

exports.getPositions = function(req) {
    return new Promise((resolve, reject) => {
        var data = {};
        data.msg = { Code: 200, Message: 'Exito!', Tipo: 'n/a' };
        var conn = config.findConfig();

        sql.connect(conn).then(function() {
            var request = new sql.Request();
            request.input('SportID', sql.Int, req.query.SportID);
            request.execute("[dbo].sp_getPositions").then(function(recordsets) {
                let rows = recordsets.recordset;
                var mainKey = rows[0];
                var selectedKey;
                for (var key in mainKey) {
                    selectedKey = key;
                }
                sql.close();
                return resolve(mainKey[selectedKey]);
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
}