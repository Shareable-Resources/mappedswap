import { DailySettlementController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: DailySettlementController = new DailySettlementController();
  constructor() {
    super(logger);
    this.prefix = 'cronJobs';
    this.setRoutes();
  }

  protected setRoutes() {
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/dailySettlements/createRealTimeOrInsert`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.createRealTimeOrInsert,
          logger,
        ),
      );

      this.router.post(
        `/${this.prefix}/dailySettlements/create`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.createDailySettlement,
          logger,
        ),
      );

      this.router.post(
        `/${this.prefix}/dailySettlements/createMany`,
        makeHandlerAwareOfAsyncErrors(this.controller.createMany, logger),
      );

      this.router.post(
        `/${this.prefix}/dailySettlements/createRealTimeDailySettlements`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.createRealTimeDailySettlements,
          logger,
        ),
      );

      this.router.post(
        `/${this.prefix}/dailySettlements/generateFromLastStart`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.generateFromLastStart,
          logger,
        ),
      );
    }
  }
}

export default Route;
