"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEndpoints = void 0;
var fs = require("fs");
var fileType = require("file-type");
var registerEndpoints = function (router) {
    router.get('/video', function (req, res) {
        var filePath = req.query.filePath;
        console.log('Got file path: ', filePath);
        fs.stat(filePath, function (err, stat) {
            // Handle file not found
            if (err !== null && err.code === 'ENOENT') {
                res.sendStatus(404);
                return;
            }
            fileType.fromFile(filePath)
                .then(function (type) {
                if (!res) {
                    res.sendStatus(404);
                    return;
                }
                var fileSize = stat.size;
                var range = req.headers.range;
                if (range) {
                    var parts = range.replace(/bytes=/, "").split("-");
                    var start = parseInt(parts[0], 10);
                    var end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    var chunksize = (end - start) + 1;
                    var file = fs.createReadStream(filePath, { start: start, end: end });
                    var head = {
                        'Content-Range': "bytes " + start + "-" + end + "/" + fileSize,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': type.mime,
                    };
                    res.writeHead(206, head);
                    file.pipe(res);
                }
                else {
                    var head = {
                        'Content-Length': fileSize,
                        'Content-Type': type.mime,
                    };
                    res.writeHead(200, head);
                    fs.createReadStream(filePath).pipe(res);
                }
            })
                .catch(function (e) {
                res.sendStatus(404);
            });
        });
    });
};
exports.registerEndpoints = registerEndpoints;
//# sourceMappingURL=serverEndpoints.js.map