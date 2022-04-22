import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { LeaderBoardRankingController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';

export default class Route extends CommonRoute {
  controller: LeaderBoardRankingController = new LeaderBoardRankingController();
  constructor() {
    super(logger);
    this.prefix = 'leaderBoardRankings';
    this.setRoutes();
  }

  protected setRoutes = (): void => {
    this.router.get(
      `/${this.prefix}`,
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  };
}
