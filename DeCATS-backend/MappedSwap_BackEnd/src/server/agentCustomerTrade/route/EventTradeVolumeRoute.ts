import { EventTradeVolumeController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: EventTradeVolumeController = new EventTradeVolumeController();
  constructor() {
    super(logger);
    this.prefix = 'eventTradeVolumes';
    this.setRoutes();
  }

  protected setRoutes() {
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/writeTradeVolume`,
        makeHandlerAwareOfAsyncErrors(this.controller.writeTradeVolume, logger),
      );
    }
  }
}

export default Route;
