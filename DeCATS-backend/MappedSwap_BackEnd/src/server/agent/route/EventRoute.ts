import { EventController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: EventController = new EventController();
  constructor() {
    super(logger);
    this.prefix = 'events';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.post(
      `/${this.prefix}/uploadEventParticipants`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.uploadEventParticipants),
    );
    this.router.post(
      `/${this.prefix}/create`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.create),
    );
    this.router.get(
      `/${this.prefix}/getEventDetails`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.getEventDetails),
    );
  }
}
export default Route;
