import {Router} from "express";
import * as fs from 'fs';
import * as fileType from 'file-type';

const registerEndpoints = (router: Router) => {
  router.get('/video', (req, res) => {
    const filePath= <string>req.query.filePath;

    fs.stat(filePath, (err, stat) => {
      // Handle file not found
      if (err !== null && err.code === 'ENOENT') {
        res.sendStatus(404);
        return;
      }

      fileType.fromFile(filePath)
        .then(type => {
          if (!res) {
            res.sendStatus(404);
            return;
          }

          const fileSize = stat.size
          const range = req.headers.range

          if (range) {

            const parts = range.replace(/bytes=/, "").split("-");

            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;

            const chunksize = (end-start)+1;
            const file = fs.createReadStream(filePath, {start, end});
            const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': type.mime,
            }

            res.writeHead(206, head);
            file.pipe(res);
          } else {
            const head = {
              'Content-Length': fileSize,
              'Content-Type': type.mime,
            }

            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
          }

        })
        .catch(e => {
          res.sendStatus(404);
        })

    });

  });
}

export {registerEndpoints};
