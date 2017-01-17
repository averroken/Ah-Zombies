var request = require("request"),
    should = require("should"),
    assert = require('assert'),
    sinon = require('sinon'),
    http = require('http'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

describe('Check Availibility URLs', function() {
    it('Home', function(done) {
        request.get('http://localhost:3000', function(err, response) {
            response.statusCode.should.equal(200);
            //body.should.include("I'm Feeling Lucky");
            done();
        })
    });
    it('Game', function(done) {
        request.get('http://localhost:3000/game', function(err, response) {
            response.statusCode.should.equal(200);
            //body.should.include("I'm Feeling Lucky");
            done();
        })
    });
    it('Contact', function(done) {
        request.get('http://localhost:3000/contact', function(err, response) {
            response.statusCode.should.equal(200);
            //body.should.include("I'm Feeling Lucky");
            done();
        })
    });
    it('Sign In', function(done) {
        request.get('http://localhost:3000/signin', function(err, response) {
            response.statusCode.should.equal(200);
            //body.should.include("I'm Feeling Lucky");
            done();
        })
    });
    it('Sign Up', function(done) {
        request.get('http://localhost:3000/signup', function(err, response) {
            response.statusCode.should.equal(200);
            //body.should.include("I'm Feeling Lucky");
            done();
        })
    });
});

/*describe('api', function() {
    describe('Check POST Request', function() {

        beforeEach(function(done){

            it('should send post params in request body - Register', function() {
                chai.request('http://localhost:3000')
                    .post('/signup')
                    .field('username', 'worsten')
                    .field('email', 'worst@howest.be')
                    .field('password', 'worstendraaier')
            });

        });
        it('check param username', function() {
            expect(res).to.have.param('username');
        });
        it('check param email', function() {
            expect(res).to.have.param('email');
        });
        it('check param password', function() {
            expect(res).to.have.param('worst');
        });
    });
})*/
/*describe('Data', function () {
    it('should return status OK (200)', function (done) {
        request.post('http://localhost:3000/signup')
            .field('username', 'worsten')
            .field('email', 'worst@howest.be')
            .field('password', 'worstendraaier')
            //.send({username: "worsten", email: "worst@howest.be", password: "worstendraaier"})
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.ok(res);
                assert.ok(res.body);
                assert.equal(res.status, 200);
                expect(res).to.have.param('username');
                //res.body.should.have.property('email');
                //res.body.should.have.property('password');
                done();
            });
    });
});*/