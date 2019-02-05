var express = require("express");
var router = express.Router();
var searchModel = require("../models/searches/search");

router.get('/search', function(req, res, next) {
    searchModel
        .search(req)
        .then(
            function(response) { //success
                console.log("Success!");
                res.send(response); //return the data
            },
            function(error) { //failed
                console.error("Failed!", error);
                res.status(404).send(error); //return error with 404
            }
        ).catch(function(ex) { //exception
            console.error("Exception!", ex);
            res.status(500).send(ex); //return exception with 500
        });
});

module.exports = router;