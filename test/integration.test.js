var expect = require('expect.js');
var Pushr = require('../');
var Faye = require('faye');
var async = require('async');

describe('Pushr', function () {
    describe('Local', function () {

        it('should create pushr', function () {
            var pushr = new Pushr();
            expect(pushr).to.be.ok();
        });

        it('should get channel', function () {
            var pushr = new Pushr();
            var channel = pushr.subscribe('test');
            expect(channel).to.be(pushr.channel('test'));
        });

        it('should channel publish', function (done) {
            var pushr = new Pushr();
            pushr.subscribe('test', function (err, channel) {
                expect(err).to.be(undefined);
                channel.bind('foo',function (data) {
                    expect(data).to.be('bar');
                    done();
                });
                channel.publish('foo', 'bar');
            });

        });

        it('should pushr publish', function (done) {
            var pushr = new Pushr();
            pushr.subscribe('test', function (err, channel) {
                channel.bind('foo',function (data) {
                    expect(data).to.be('bar');
                    done();
                });
                pushr.publish('test', 'foo', 'bar');
            });
        });

        it('should publish multi channels', function (done) {
            var pushr = new Pushr();
            async.series([
                pushr.subscribe.bind(pushr, 'test1'),
                pushr.subscribe.bind(pushr, 'test2')
            ], function (err, channels) {
                async.eachSeries(channels, function (channel, callback) {
                    channel.bind('foo',function (data) {
                        expect(data).to.be('bar');
                        ok();
                    });
                    callback();
                }, function () {
                    pushr.publish(['test2', 'test2'], 'foo', 'bar');
                });
            });

            var i = 2;
            function ok() {
                if (--i == 0) done();
            }
        });
    });

    describe('Server and Client', function () {

        var bayeux, pushr;

        var port = Math.floor(Math.random() * 5e4 + 1e4);

        beforeEach(function (done) {

            bayeux = new Faye.NodeAdapter({mount: '/faye', timeout: 45});
            bayeux.listen(port, null, function () {
                pushr = new Pushr('http://127.0.0.1:' + port + '/faye');
                done();
            });
        });

        afterEach(function (done) {
            pushr.disconnect();
            bayeux.stop(done);
        });

        it('should channel publish', function (done) {
            pushr.subscribe('test', function (err, channel) {
                channel.bind('foo',function (data) {
                    expect(data).to.be('bar');
                    done();
                });
                channel.publish('foo', 'bar');
            });
        });

        it('should pushr publish', function (done) {
            pushr.subscribe('test', function (err, channel) {
                channel.bind('foo',function (data) {
                    expect(data).to.be('bar');
                    done();
                });
                pushr.publish('test', 'foo', 'bar');
            });
        });
    });
});