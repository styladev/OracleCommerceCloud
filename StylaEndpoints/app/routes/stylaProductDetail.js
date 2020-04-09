//stylaProductDetail.js
module.exports = function (app, logger, occConfig) {
    'use strict';
    var DataTransform = require("node-json-transform").DataTransform;
    var CommerceSDK = require('../lib/commerce-rest');
    var storeSDK = new CommerceSDK(occConfig);

    var map = {
        list: 'list',
        item: {
            id: "repositoryId",
            type: "itemType",
            name: "displayName",
            price: "salePrices",
            oldPrice: "listPrices",
            description: "description",
            maxqty: "maxqty",
            minqty: "minqty",
            children: "childSKUs",
            attributes: "dynamicPropertyMapString",
            saleable: "active",
            tax: "tax",
            priceTemplate: "priceTemplate"
        },
        operate: [
            {
                'run': function (priceGroups, context) {
                    if (context.currency != null) {
                        return priceGroups["pricegroup_" + context.currency];
                    } else {
                        return priceGroups;
                    }
                },
                'on': 'price'
            },
            {
                'run': function (priceGroups, context) {
                    if (context.currency != null) {
                        return priceGroups["pricegroup_" + context.currency];
                    } else {
                        return priceGroups;
                    }
                },
                'on': 'oldPrice'
            },
            {
                'run': function (priceTemplate, context) {
                    if (context.currency != null) {
                        if (context.currency == "EUR") {
                            return "#{price} \u20AC";
                        } else if (context.currency == "USD" || context.currency == "CAD") {
                            return "#{price} \u0024";
                        } else if (context.currency == "GBP") {
                            return "\u00A3 #{price}";
                        } else {
                            return priceTemplate;
                        }                        
                    } else {
                        return priceTemplate;
                    }
                },
                'on': 'priceTemplate'
            },
            {
                'run': function (ary, context) {
                    return DataTransform({ list: ary }, map).transform(context);
                },
                'on': 'children'
            }
        ],
        each: function (item, index, collection, context) {
            if (item.maxqty == null) {
                item.maxqty = 99999;
            }
            if (item.minqty == null) {
                item.minqty = 1;
            }
            if (item.price == null) {
                item.price = item.oldPrice;
            }
            return item;
        }
    };
    
    app.get('/v1/stylaProductDetail', function (req, res) {
        try {
            logger.debug('GET /stylaProductDetail');

            res.type('application/json'); // set content-type
            storeSDK.get({
                url: '/ccadmin/v1/products/' + req.query.id, callback: function (err, response) {
                    'use strict';
                    if (err) {
                        res.status(400).send(response);
                        return;
                    }
                    var context = { currency: req.query.pricegroup };
                    var product = { list: [response] };
                    var dataTransform = DataTransform(product, map);
                    var promise = dataTransform.transformAsync(context);
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