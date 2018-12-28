var config = require("../connections/FreeAgentConnection.js"),
    sql = require('mssql'),
    publish = require('../publisher.js'),
    jwt = require('jsonwebtoken')

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
            publish.publisher(res, records);
            sql.close();
        });
    }).catch(function() {
        data.msg.Code = 500;
        data.msg.Message = err.message;
        publish.publisher(res, data);
        sql.close();
    });

}