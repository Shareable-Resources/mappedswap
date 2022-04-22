import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import foundationConst from '../const';
import winston from 'winston';
import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from './ApiMessage';
import foundationConfigJSON from '../../config/FoundationConfig.json';
import { ServerReturnCode } from './ServerReturnCode';
import { now } from 'sequelize/types/lib/utils';
import logger from '../../general/util/ServiceLogger';
import ReadlineHelper from '../utils/ReadlineHelper';

const foundationConfig =
  foundationConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
export function clientErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    if (err.name == 'TokenExpiredError') {
      res.status(401).send(err.message);
    } else {
      const errMsg = err.message ? err.message : '';
      const errStack = err.stack ? err.stack : '';
      const errName = err.name;
      const generalErrMsg = `[${errName}] : ${errMsg}  `;

      const errRes = apiResponse(
        res,
        responseBySuccess(null, false, 'error', 'error', generalErrMsg),
        statusCode(false, 'error'),
      );
      next(errRes);
    }
  }
}

export function errorHandler(err: Error, req: Request, res: Response) {
  res.status(500).send({ error: err.message });
}

export function timeMiddleware(req: any, res: Response, next: NextFunction) {
  req.requestTime = Date.now();
  next();
}

function logReq(req: any, logger?: winston.Logger) {
  const msgParams =
    Object.keys(req.params).length != 0
      ? `[params] ${JSON.stringify(req.params)}`
      : '';
  const msgQuery =
    Object.keys(req.query).length != 0
      ? `[query] ${JSON.stringify(req.query)}`
      : '';
  const msgBody =
    Object.keys(req.body).length != 0
      ? `[body] ${JSON.stringify(req.body)}`
      : '';

  const msgStack =
    Object.keys(req.body).length != 0
      ? `[body] ${JSON.stringify(req.body)}`
      : '';

  logger?.debug(`[API] ${req.url}`, {
    message: `${msgParams} ${msgQuery} ${msgBody}`,
  });
}

// We create a wrapper to workaround async errors not being transmitted correctly.
export function makeHandlerAwareOfAsyncErrors(
  handler: any,
  logger?: winston.Logger,
) {
  return async (req: any, res: any, next: any) => {
    logReq(req, logger);
    try {
      await handler(req, res);
    } catch (error: any) {
      logger?.error(error);
      clientErrorHandler(error, req, res, next);
    }
  };
}

export function accessControlAllowMiddleware(
  req: any,
  res: Response,
  next: NextFunction,
) {
  // Website you wish to allow to connect
  const origin = req.headers.origin;

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  // Request allow every origin to call
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,Content-Type,Authorization',
  );
  // Request headers you wish to allow
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Pass to next layer of middleware
  next();
}

export function ContentTypeMiddleWare(
  req: any,
  res: Response,
  next: NextFunction,
) {
  res.header('Content-Type', 'application/json');
  next();
}

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  /*
	try {
		req.body = removeEmpty(req.body);

		const valid = validateUserRegistration(req.body);

		if (valid.length > 0) {
			apiResponse<FailedResponse>(res, failedResponse(valid), BAD_REQUEST);
		} else {
			next();
		}
	} catch (error) {
		apiResponse<FailedResponse>(
			res,
			failedResponse(getStatusText(INTERNAL_SERVER_ERROR)),
			INTERNAL_SERVER_ERROR
		);
	}*/
}
export function validatingLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  /*
	try {
		req.body = removeEmpty(req.body);

		const valid = validateLogin(req.body);

		if (valid.length > 0) {
			apiResponse<CustomRes>(res, failedResponse(valid), BAD_REQUEST);
		} else {
			next();
		}
	} catch (error) {
		apiResponse<CustomRes>(
			res,
			failedResponse(getStatusText(INTERNAL_SERVER_ERROR)),
			INTERNAL_SERVER_ERROR
		);
	}*/
}

export function isMiddlewareAPI(url: string) {
  const isMiddlewareAPI = true;
  /*
  for (let i = 0; i < ignoreTokenAPI.length; i++) {
    if (url.includes(ignoreTokenAPI[i])) {
      isMiddlewareAPI = false;
      break;
    }
  }*/
  return isMiddlewareAPI;
}

export function validateToken(logger: winston.Logger) {
  return async function (req, res, next) {
    try {
      const decode = await jwt.verify(
        req.headers['authorization'],
        foundationConfig.jwt.TOKEN_KEY,
      );
      req.jwt = decode;
      next();
    } catch (e: any) {
      logger.error(e.message);
      apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.LoginTokenInvalid, e.message),
        statusCode(false, 'query'),
      );
    }
  };
}

export async function validateFundingCode(
  fundingCode: any,
): Promise<ResponseBase> {
  const resp = new ResponseBase();
  await jwt.verify(
    fundingCode,
    foundationConfig.fundingCode.TOKEN_KEY,
    function (err: any, decoded: any) {
      if (err) {
        resp.success = false;
        resp.msg = err;
        return resp;
      } else {
        resp.success = true;
        resp.msg = '';
        return resp;
      }
    },
  );

  return resp;
}

export function unless(allRoutes: any[], unlessPaths: string[], middleware) {
  return function (req, res, next) {
    // console.log("req.path: ", req.path);
    // console.log('paths : ' + paths);
    console.log('req.path : ' + req.path);
    if (unlessPaths.includes(req.path)) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
}

export async function denyCustomerToken(
  req: any,
  res: Response,
  next: NextFunction,
) {
  if (req.jwt.type == 'Customer') {
    apiResponse(
      res,
      new WarningResponseBase(
        ServerReturnCode.LoginTokenInvalid,
        'Token Invalid',
      ),
      statusCode(false, 'query'),
    );
  } else {
    next();
  }
}

//Put this middleware after all routes has registered to express server
export function redirectTo404IfRoutesNotFound(logger: winston.Logger) {
  if (!logger) {
    throw new Error('Please pass server logger');
  }
  return function (req, res, next) {
    logger.error(`Unexpected Route!`);
    logger.error(
      `Path : [${req.path}] | IPs: [${req.ips.join(', ')} ]| IP: [${
        req.ip
      }] | RemoteAddress: [${req.connection.remoteAddress}]`,
    );
    // you can do what ever you want here
    // for example rendering a page with '404 Not Found'
    res.status(404).send('<h2>404 Not Found</h2>');
  };
}
