import {
  EventController,
  LeaderboardRankingController,
} from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: EventController = new EventController();
  constructor() {
    super(logger);
    this.prefix = 'events';
    this.setRoutes();
  }

  protected setRoutes() {
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/distributeToken`,
        makeHandlerAwareOfAsyncErrors(this.controller.distributeToken, logger),
      );
    }
  }
}

export default Route;
