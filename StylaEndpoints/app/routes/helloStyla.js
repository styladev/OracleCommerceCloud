//helloStyla.js
module.exports = function (app, logger, occConfig) {

    var CommerceSDK = require('../lib/commerce-rest');
    var storeSDK = new CommerceSDK(occConfig);  

    app.get('/v1/helloStyla', function(req, res) {
        logger.info("GET /helloStyla");
        storeSDK.post({
            url: '/ccagent/v1/verify', callback: function (err, response) {
                'use strict';
                if (err) {
                    res.status(400).send(response);
                    return;
                }
                res.status(200).send({ "test": "ok", "response": response });
            }
        });
    });

};