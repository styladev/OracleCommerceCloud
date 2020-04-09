'use strict';
// index.js
var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var logger = require('winston');

var occConfig = {
    hostname: "ccadmin-prod-zb1a.oracleoutsourcing.com",
    port: null,
    apiKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiYWZmZTU2ZC01NjU4LTRmOWMtYjc1Ny1hMDNmYjdhYWM5ZTkiLCJpc3MiOiJhcHBsaWNhdGlvbkF1dGgiLCJleHAiOjE2MTA3MDE5MzAsImlhdCI6MTU3OTE2NTkzMH0=.4OdOzw/bWDr+yERSyjeaGklxO/NV2Zrt/+z8g5W0iP8="
}
// Export Express 4 style sup-application in order to be embedded in OCCS server-side extension architecture
//var app = module.exports = new express.Router();
var app = module.exports = express();

app.use(bodyParser.json({
	/*
	From http://docs.oracle.com/cd/E78936_01/Cloud.16-5/ExtendingCC/html/s0304securewebhooks01.html
	Webhook events are signed so that the system receiving the event can verify their authenticity. 
	Webhook POST requests include an HMAC SHA1 signature in the X-Oracle-CC-WebHook-Signature header. 
	This signature is calculated using the secret key to generate a hash of the raw UTF-8 bytes of the body of the post. 
	A base64 encoding is then used to turn the hash into a string. 
	*/
    verify: function(req, res, buf, encoding) {
		
		if (req.headers['x-oracle-cc-webhook-signature'] !== undefined) {
			//Read secret key from config 
			if (config.has('keys.'+req.url)) {
				
				var secret_key = config.get('keys.'+req.url);
				logger.info('config.keys'+req.url+':', secret_key);
				
				// Secret key is base64 encoded and must be decoded into bytes; BUG 24619421::Documentation for HMAC SHA1 key from the raw key bytes 
				var decoded_secret_key = Buffer.from(secret_key, 'base64'); 

				var calculated_signature = crypto.createHmac('sha1', decoded_secret_key)
					.update(buf, encoding)
					.digest('base64');

				logger.debug("x-oracle-cc-webhook-signature: ", req.headers['x-oracle-cc-webhook-signature'], "calculated_signature: ", calculated_signature );
				
				if (calculated_signature != req.headers['x-oracle-cc-webhook-signature']) {
					logger.error('Invalid signature. Access denied');
					throw new Error('Invalid signature. Access denied');
				}
			}
		}  else {
			logger.warn('No secret key provided for request: ' + req.url);
			//throw new Error('Signature not included. Access denied');
		}
    }
}));

try {
	// Load all routes
    require('./routes')(app, logger, occConfig);
} catch (e) {
	logger.error(e.message);
}


//app.listen(3000, function () {
//  logger.info('Listening on port 3000...');
//});
