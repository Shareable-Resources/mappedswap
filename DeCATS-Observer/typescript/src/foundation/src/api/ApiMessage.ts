import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
export class RequestBase {
  method: string = '';
  requestPath: string = '';
  nonce: string = '';
}

export class ResponseBase {
  success: boolean;
  data: any;
  respType: ResponseType;
  msg: string;
  constructor() {
    this.success = false;
    this.data = undefined;
    this.respType = 'info';
    this.msg = '';
  }
}

export interface ApiResponse {
  <T>(
    res: Response,
    data: T,
    statusCode: number,
    rootElement?: string,
  ): Response;
}

export const apiResponse: ApiResponse = (
  res,
  data,
  statusCode,
  rootElement = '',
): Response => {
  return res.format({
    json: () => {
      res.type('application/json');
      res.status(statusCode).send(data);
    },
  });
};

export function successResponse(data: any, msg?: string): ResponseBase {
  const resData = new ResponseBase();
  resData.success = true;
  resData.data = data;
  resData.msg = msg ? msg : 'Success';
  return resData;
}

export function failedResponse(data: any, msg?: string): ResponseBase {
  const resData = new ResponseBase();
  resData.success = false;
  resData.data = data;
  resData.msg = msg ? msg : 'Fail';
  return resData;
}

export function statusCode(success: boolean, type: APIType) {
  switch (type) {
    case 'up':
      return success ? StatusCodes.OK : StatusCodes.NOT_ACCEPTABLE;
    case 'del':
      return success ? StatusCodes.OK : StatusCodes.NOT_ACCEPTABLE;
    case 'add':
      return success ? StatusCodes.OK : StatusCodes.NOT_ACCEPTABLE;
    case 'query':
      return success ? StatusCodes.OK : StatusCodes.NOT_ACCEPTABLE;
  }
}

export function responseBySuccess(
  data: any,
  success: boolean,
  type: APIType,
  respType?: ResponseType,
  msg?: string,
): ResponseBase {
  const resData = new ResponseBase();
  resData.success = success ? true : false;
  resData.data = data;
  resData.respType = respType ? respType : 'info';
  if (success) {
    switch (type) {
      case 'up':
        resData.msg = msg ? msg : 'Update Success';
        break;
      case 'del':
        resData.msg = msg ? msg : 'Delete Success';
        break;
      case 'add':
        resData.msg = msg ? msg : 'Create Success';
        break;
      case 'query':
        resData.msg = msg ? msg : 'Found';
        break;
    }
  } else {
    resData.msg = msg ? msg : 'Fail';
  }

  return resData;
}

export type APIType = 'up' | 'del' | 'add' | 'query';
export type ResponseType = 'warning' | 'info' | 'success' | 'error';
