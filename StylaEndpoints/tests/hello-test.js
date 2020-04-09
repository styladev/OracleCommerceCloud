//Require the dev-dependencies
var request = require('request');

describe('Sample hello world Jasmine tests', function() {

	it('should respond /helloStyla GET', function(done) {
        request.get('/v1/helloStyla'), (function(err, res){
			expect(res.statusCode).toBe(200);
			done();
		});
	});
});
