import { AgentDailyReportController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../../agent/util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: AgentDailyReportController = new AgentDailyReportController();
  constructor() {
    super(logger);
    this.prefix = 'agentDailyReports';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getIncomeAnalysis`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getIncomeAnalysis, logger),
    );
  }
}

export default Route;
