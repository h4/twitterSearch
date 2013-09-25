"use strict";

var http = require('http');
var redis = require('redis');
var configParser = require('./lib/configParser');
var search = require('./lib/search');
var url = require('url');

var redisClient = redis.createClient();
var server = http.createServer();

redisClient.select(configParser.get('dbNum'));

server.on("request", function(req, res) {
    if (req.url === '/favicon.ico') {
        return;
    }

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    
    res.writeHead(200, {
        'access-control-allow-origin': '*',
        'content-type': 'application/json'
    });

    redisClient.lrange('tweets', 0, 20, function(err, data) {
        var responseData = '[' + data.join(',') + ']';

        if ('callback' in query) {
            responseData = query.callback + '(' + responseData + ')';
        }

        res.write(responseData);
        res.end();
    });
});

search.search(configParser.get('defaultQuery'));
server.listen(configParser.get('port') || 8000);
