import {
  apiResponse,
  responseBySuccess,
  statusCode,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import logger from '../util/ServiceLogger';
import fs from 'fs';
import { folderPath } from '../../../foundation/utils/logger';
import { serverName } from '../const/index';
export class Controller implements CommonController {
  /**
   * @description Creates an instance of hello world log controller.
   *
   * @constructor
   *
   */
  constructor() {
    this.read = this.read.bind(this);
  }

  async read(req: any, res: any) {
    const allowedFolder = ['info', 'error'];
    if (!allowedFolder.includes(req.query.folder)) {
      throw new Error(
        `Folder path not allowed (Allow only [info][error] as folder query), e.g. /logs/read?linesLimit=10&folder=info   or   /logs/read?linesLimit=10&folder=info&date=2021-09-23`,
      );
    }

    const linesLimit = req.query.linesLimit ? req.query.linesLimit : 40;
    const folder = req.query.folder;
    const date = req.query.date ? req.query.date : '';
    let logPath = `${folderPath.dist}/${folder}/${serverName}`;
    logPath = date ? `${logPath}-${date}` : logPath;
    logPath = `${logPath}.log`;
    try {
      const logsArray: any = await this.readLog(logPath);
      const sliceArray = logsArray.slice(
        Math.max(logsArray.length - linesLimit, 1),
      );
      return apiResponse(
        res,
        responseBySuccess(
          sliceArray,
          true,
          'query',
          'info',
          `Log read (Last ${linesLimit} lines) in ${logPath}`,
        ),
        statusCode(true, 'query'),
      );
    } catch (e) {
      logger.error(e);
      throw new Error('Cannot read file : ' + e);
    }
  }

  async getAll() {
    throw new Error('Not Implemented');
  }

  async readLog(logPath) {
    if (!fs.existsSync(logPath)) {
      throw 'File does not existed';
    }
    const promise = await new Promise((resolve, reject) => {
      fs.readFile(logPath, (err, results) => {
        resolve(results.toString().split('\n'));
      });
    }).catch((err) => {
      throw err;
    });
    return promise;
  }
}
export default Controller;
