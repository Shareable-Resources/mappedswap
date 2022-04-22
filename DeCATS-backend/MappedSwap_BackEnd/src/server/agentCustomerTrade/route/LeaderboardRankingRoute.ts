import { LeaderboardRankingController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: LeaderboardRankingController = new LeaderboardRankingController();
  constructor() {
    super(logger);
    this.prefix = 'leaderboardRankings';
    this.setRoutes();
  }

  protected setRoutes() {
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/writeTop20Leaderboards`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.writeTop20Leaderboards,
          logger,
        ),
      );
    }
  }
}

export default Route;
