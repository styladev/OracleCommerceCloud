/**
 *  StylaPluginWidget.js
 */

define(
    //-------------------------------------------------------------------
    // DEPENDENCIES
    //-------------------------------------------------------------------
    ['knockout', 'jquery', 'ccRestClient', 'ccConstants', 'pubsub'],
    //-------------------------------------------------------------------
    // MODULE DEFINITION
    //-------------------------------------------------------------------
    function (ko, $, ccRestClient, ccConstants, pubsub) {
        "use strict";
        return {
            onLoad: function (widget) {
                console.log('-- StylaPluginWidget.js onLoad --');
                $('<script />', { type: 'text/javascript', src: 'https://engine.styla.com/init.js', async: true }).appendTo('head');
                //Modular content mode initialization
                if (typeof widget.stylaSlotId !== "undefined") {

                    window.styla = window.styla || { callbacks: [] };
                    window.styla.callbacks.push({
                        'addToCart': function (productId, qty) {
                            var input = {};
                            var pathParam = productId;

                            var url = ccConstants.ENDPOINT_PRODUCTS_GET_PRODUCT;
                            ccRestClient.request(url,
                                input,
                                function (data) { widget.cart().addItem(data); },
                                function (err) { console.log(err + "(Product Id: " + productId + " not found!)"); },
                                pathParam);
                        }
                    });

                    //var slotSelector = widget.widgetId() + "-" + widget.id();
                    //$('<div />', { 'data-styla-slot': widget.stylaSlotId() }).appendTo(slotSelector);
                } else {
                    console.log('-- Styla Slot Id is undefined. Please define Styla Slot Id. --');
                } 
            },
            beforeAppear: function (page) {
            }
        };
    }
);