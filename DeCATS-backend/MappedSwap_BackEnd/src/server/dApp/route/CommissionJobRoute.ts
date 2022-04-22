import {
  makeHandlerAwareOfAsyncErrors,
  validateAgentType,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CommissionJobController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { AgentType } from '../../../general/model/dbModel/Agent';
import {
  apiResponse,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import inspector from 'inspector';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
class Route extends CommonRoute {
  controller: CommissionJobController = new CommissionJobController();
  constructor() {
    super(logger);
    this.prefix = 'commissionJobs';
    this.setRoutes();
  }
  addTestingParams() {
    return async function (req, res, next) {
      req.jwt = {
        agentId: 86,
      };
      next();
    };
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}/getLedgers`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getLedgers, logger),
    );
    this.router.get(
      `/${this.prefix}/getExpectedCommission`,
      validateToken(logger),
      validateAgentType(logger, AgentType.MST),
      makeHandlerAwareOfAsyncErrors(
        this.controller.getExpectedCommission,
        logger,
      ),
    );
    this.router.get(
      `/${this.prefix}/getSubAgentsWeeklyCommission`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(
        this.controller.getSubAgentsWeeklyCommission,
        logger,
      ),
    );

    this.router.get(
      `/${this.prefix}/getLedgersDetails`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getLedgersDetails, logger),
    );

    this.router.post(
      `/${this.prefix}/acquireSuccess`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.acquireSuccess, logger),
    );
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.get(
        `/${this.prefix}/getExpectedCommissionTest`,
        this.addTestingParams(),
        makeHandlerAwareOfAsyncErrors(
          this.controller.getExpectedCommission,
          logger,
        ),
      );
    }
  }
}

export default Route;
