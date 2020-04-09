//stylaSearch.js
module.exports = function (app, logger, occConfig) {
    'use strict';
    var DataTransform = require("node-json-transform").DataTransform;
    var CommerceSDK = require('../lib/commerce-rest');
    var storeSDK = new CommerceSDK(occConfig);

    var args_map = {
        list: 'queries',
        item: {
            q: "search",
            limit: "limit",
            offset: "offset",
            categoryId: "category",
            catalogId: "siteCatalog"
        },
        each: function (item) {
            if (item.q === null || item.q === "") {
                delete item.q;
            } else {
                var queries = item.q.split(" ");
                var query = "";
                
                queries.forEach(function (i, idx, array) {
                    var andVar = " and ";
                    if (idx === array.length - 1) {
                        andVar = "";
                    }

                    query = query + "displayName co \"" + i + "\"" + andVar;               
                });
                //console.log(query);
                item.q = query;
            }

            if (item.limit === null || item.limit === "") {
                delete item.limit;
            }

            if (item.offset === null || item.offset === "") {
                delete item.offset;
            }

            if (item.categoryId === null || item.categoryId === "") {
                delete item.categoryId;
            }

            if (item.catalogId === null || item.catalogId === "") {
                delete item.catalogId;
            }

            return item;
        }
    };

    var map = {
        list: 'items',
        item: {
            id: "repositoryId",
            caption: "displayName",
            image: "largeImageURLs",
            pageUrl: "route"
        }
    };
    
    app.get('/v1/stylaSearch', function (req, res) {
        try {
            logger.debug('GET /stylaSearch');

            res.type('application/json'); // set content-type
            var reqParams = {
                queries: [req.query]
            };
            var dataTransformArgs = DataTransform(reqParams, args_map);
            var args_result = dataTransformArgs.transform();
            //console.log(req.query);
            //console.log(reqParams);
            //console.log(args_result[0]);
            storeSDK.get({
                data: args_result[0],
                url: '/ccadmin/v1/products', callback: function (err, response) {
                    'use strict';
                    if (err) {
                        res.status(400).send(response);
                        return;
                    }
                    var dataTransform = DataTransform(response, map);
                    var promise = dataTransform.transformAsync();
                    promise.then(function (result) {
                        res.status(200).send(result);
                    });
                }
            });
        } catch (e) {
            logger.error("Error: " + e.message);
            res.end();
            return;
        }
    });
};