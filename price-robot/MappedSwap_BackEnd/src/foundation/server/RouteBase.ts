/* eslint-disable @typescript-eslint/no-inferrable-types */
// src/routes/route.ts

import { Router } from 'express';
import CommonController from './CommonController';
import { makeHandlerAwareOfAsyncErrors } from './Middlewares';
import ExcludeRouteOption from './ExcludeRoutes';
import path from 'path';
abstract class RouteBase {
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

  protected setRootRoute(serverName: string) {
    // Root route will display index.html which locates in dist/public if NODE_ENV is dev or local
    // Otherwise only display a welcome plain h2 element
    this.router.get('/', (req: any, res: any) => {
      const showApiEnv = ['dev', 'local'];
      const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'local';
      if (showApiEnv.includes(env)) {
        res.send(
          `<h2>Hello, ${serverName} is listening!</h2><p>Admin Server Starts</p>`,
        );
      } else {
        res.sendFile(
          path.resolve(__dirname + '../../../../../../public/index.html'),
        );
      }
    });
  }

  protected setDefaultRoutes(exclude?: ExcludeRouteOption) {
    exclude = exclude ? exclude : new ExcludeRouteOption();
    if (this.controller.getAll && !exclude.getAll) {
      this.router.get(
        `/api/${this.prefix}`,
        makeHandlerAwareOfAsyncErrors(this.controller.getAll),
      );
    }
    if (this.controller.getById && !exclude.getById) {
      this.router.get(
        `/api/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.getById),
      );
    }
    if (this.controller.create && !exclude.create) {
      this.router.post(
        `/api/${this.prefix}`,
        makeHandlerAwareOfAsyncErrors(this.controller.create),
      );
    }
    if (this.controller.update && !exclude.update) {
      this.router.put(
        `/api/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.update),
      );
    }
    if (this.controller.remove && !exclude.remove) {
      this.router.delete(
        `/api/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.remove),
      );
    }
    if (this.controller.patch && !exclude.patch) {
      this.router.patch(
        `/api/${this.prefix}/:id`,
        makeHandlerAwareOfAsyncErrors(this.controller.patch),
      );
    }
  }

  constructor() {}
}

export default RouteBase;
