import { NextFunction, Request, Response } from 'express';
import loggerHelper from '../logger';
import jwt from 'jsonwebtoken';
import foundationConst from '../const';
const env = process.env.NODE_ENV || 'development';

export function logging(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //logger.error(err);
  next(err);
}

export function clientErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //logger.error(err.name);
  //	logger.error(err.message);
  //logger.error(err.stack);
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    if (err.name == 'TokenExpiredError') {
      res.status(401).send(err.message);
    } else {
      next(err);
    }
  }
}

export function errorHandler(err: Error, req: Request, res: Response) {
  res.status(500).send({ error: err.message });
}

export function timeMiddleware(req: any, res: Response, next: NextFunction) {
  req.requestTime = Date.now();
  /*
	logger.info(
		`Request Time: (${moment(Date.now()).format("YYYY-MM-DD")})   :   ${
			req.url
		}`
	);*/
  next();
}

// We create a wrapper to workaround async errors not being transmitted correctly.
export function makeHandlerAwareOfAsyncErrors(handler: any) {
  return async (req: any, res: any, next: any) => {
    try {
      await handler(req, res);
    } catch (error) {
      clientErrorHandler(error, req, res, next);
    }
  };
}

export async function jwtVertificaitonMiddleWare(
  req: any,
  res: Response,
  next: NextFunction,
) {
  // Website you wish to allow to connect

  // Header names in Express are auto-converted to lowercase
  try {
    let token =
      req.headers['x-access-token'] ||
      req.headers['authorization'] ||
      req.query.token;

    // Remove Bearer from string
    if (token == 'Bearer ABCDEFG') {
      req.user.id = 'sys';
    } else if (isMiddlewareAPI(req.url)) {
      token = token.replace(/^Bearer\s+/, '');
      const decoded: any = jwt.verify(token, foundationConst.jwtSecret);
      req.user = decoded.user;
    }
  } catch (e) {
    next(e);
  }

  next();
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
  let isMiddlewareAPI = true;
  /*
  for (let i = 0; i < ignoreTokenAPI.length; i++) {
    if (url.includes(ignoreTokenAPI[i])) {
      isMiddlewareAPI = false;
      break;
    }
  }*/
  return isMiddlewareAPI;
}
