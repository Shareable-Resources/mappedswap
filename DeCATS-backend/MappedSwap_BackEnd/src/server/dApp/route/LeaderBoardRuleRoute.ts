import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { LeaderBoardRuleController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';

export default class Route extends CommonRoute {
  controller: LeaderBoardRuleController = new LeaderBoardRuleController();
  constructor() {
    super(logger);
    this.prefix = 'leaderBoardRules';
    this.setRoutes();
  }

  protected setRoutes = (): void => {
    this.router.get(
      `/${this.prefix}`,
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  };
}
