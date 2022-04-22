/* eslint-disable @typescript-eslint/no-inferrable-types */
// src/routes/route.ts

import { Router } from 'express';
import CommonController from '../controller/common_controller';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/src/api/middlewares';

abstract class Route {
  protected controller: CommonController = new CommonController();
  protected router = Router();
  protected abstract setRoutes(controller: CommonController): void;
  protected prefix: string = '/';

  public getRouter() {
    return this.router;
  }
  public getPrefix() {
    return this.prefix;
  }

  protected setDefaultRoutes() {
    if (this.controller.getAll) {
      this.router.get(
        `/${this.prefix}`,
        makeHandlerAwareOfAsyncErrors(this.controller.getAll),
      );
    }
    if (this.controller.getById) {
      this.router.get(
        `/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.getById),
      );
    }
    if (this.controller.create) {
      this.router.post(
        `/${this.prefix}`,
        makeHandlerAwareOfAsyncErrors(this.controller.create),
      );
    }
    if (this.controller.update) {
      this.router.put(
        `/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.update),
      );
    }
    if (this.controller.remove) {
      this.router.delete(
        `/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.remove),
      );
    }
    if (this.controller.patch) {
      this.router.patch(
        `/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.patch),
      );
    }
  }

  constructor() {}
}

export default Route;
