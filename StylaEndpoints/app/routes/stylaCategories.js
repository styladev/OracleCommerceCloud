//stylaCategories.js
module.exports = function (app, logger, occConfig) {
    'use strict';
    var DataTransform = require("node-json-transform").DataTransform;
    var CommerceSDK = require('../lib/commerce-rest');
    var storeSDK = new CommerceSDK(occConfig);

    var args_map = {
        list: 'queries',
        item: {
            limit: "limit",
            offset: "offset",
            catalogId: "siteCatalog"
        },
        each: function (item) {
            if (item.limit === null || item.limit === "") {
                delete item.limit;
            }

            if (item.offset === null || item.offset === "") {
                delete item.offset;
            }

            if (item.catalogId === null || item.catalogId === "") {
                delete item.catalogId;
            }

            return item;
        }
    };

    var categoryMap = {
        list: 'items',
        item: {
            id: "repositoryId",
            name: "name",
            children: "childCategories"
        },
        operate: [
            {
                'run': function (ary) {
                    return DataTransform({ items: ary }, categoryMap).transform();
                },
                'on': 'children'
            }
        ],
        each: function (item, index, collection, context) {
            if (item.name == null) {
                item.name = item.id;
            }
            return item;
        }
    };

    var map = {
        list: 'items',
        item: {
            id: "repositoryId",
            name: "displayName",
            children: "childCategories"
        },
        operate: [
            {
                'run': function (ary) {                  
                    return DataTransform({ items: ary }, map).transform();
                },
                'on': 'children'
            }
        ],
        each: function (item, index, collection, context) {
            if (item.name == null) {
                item.name = item.id;
            }
            return item;
        }
    };

    app.get('/v1/stylaCategories', function (req, res) {
        try {
            logger.debug('GET /stylaCategories');
            res.type('application/json'); // set content-type
            var reqParams = {
                queries: [req.query]
            };
            var dataTransformArgs = DataTransform(reqParams, args_map);
            var args_result = dataTransformArgs.transform();
            //console.log(req.query);
            //console.log(reqParams);
            //console.log(args_result[0]);
            var collectionsPromise = new Promise(function (resolve, reject) {
                storeSDK.get({
                    data: args_result[0],
                    url: '/ccadmin/v1/collections', callback: function (err, response) {
                        'use strict';
                        if (err) {
                            res.status(400).send(response);
                            return;
                        }
                        resolve(response);
                    }
                });
            });
            collectionsPromise.then(function (response) {
                var dataTransform = DataTransform(response, map);
                var promise = dataTransform.transformAsync();
                promise.then(function (result) {
                    res.status(200).send(result);
                });
            });

        } catch (e) {
            logger.error("Error: " + e.message);
            res.end();
            return;
        }
    });

    app.get('/v1/stylaCategories/:categoryId', function (req, res) {
        try {
            logger.debug('GET /stylaCategories');
            res.type('application/json'); // set content-type
            var categoryId = req.params.categoryId;
            var collectionPromise = new Promise(function (resolve, reject) {
                storeSDK.get({
                    url: '/ccadmin/v1/collections/' + categoryId, callback: function (err, response) {
                        'use strict';
                        if (err) {
                            res.status(400).send(response);
                            return;
                        }
                        resolve(response);
                    }
                });
            });
            collectionPromise.then(function (response) {
                var dataTransform = DataTransform({ items: [response] }, categoryMap);
                var promise = dataTransform.transformAsync();
                promise.then(function (result) {
                    res.status(200).send(result);
                });
            });

        } catch (e) {
            logger.error("Error: " + e.message);
            res.end();
            return;
        }
    });
};