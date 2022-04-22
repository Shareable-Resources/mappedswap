import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { AgentController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: AgentController = new AgentController();
  constructor() {
    super(logger);
    this.prefix = 'agents';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/details/:id`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getById),
    );
    this.router.post(
      `/${this.prefix}/create`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.create, logger),
    );
    this.router.post(
      `/${this.prefix}/update`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.update, logger),
    );
    this.router.get(
      `/${this.prefix}/getNoOfNodes`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getNoOfNodes, logger),
    );
    this.router.post(
      `/${this.prefix}/changeRole`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.changeRole, logger),
    );
    this.router.get(
      `/${this.prefix}/getSubAgent`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getSubAgent, logger),
    );
    this.router.post(
      `/${this.prefix}/genReferralCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.genReferralCode, logger),
    );
    this.router.get(
      `/${this.prefix}/getAllReferralCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllReferralCode, logger),
    );
    this.router.get(
      `/${this.prefix}/getCurrentLevelDetails`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(
        this.controller.getCurrentLevelDetails,
        logger,
      ),
    );
    this.router.post(
      `/${this.prefix}/updateSelf`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.updateSelf, logger),
    );
    this.router.post(
      `/${this.prefix}/updateSelfPassword`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.updateSelfPassword, logger),
    );

    //Non jwt API
    this.router.post(
      `/${this.prefix}/registerWithReferralCode`,
      makeHandlerAwareOfAsyncErrors(
        this.controller.registerWithReferralCode,
        //validateToken(logger),
        logger,
      ),
    );
    this.router.post(
      `/${this.prefix}/login`,
      //validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.login, logger),
    );

    //The below route only can be visible in dev debug mode (Open by vs debugger)
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/verifySignDataOfOldUser`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.verifySignDataOfOldUser,
          //validateToken(logger),
          logger,
        ),
      );
      this.router.post(
        `/${this.prefix}/insertSignDataOfOldUser`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.insertSignDataOfOldUser,
          //validateToken(logger),
          logger,
        ),
      );

      this.router.post(
        `/${this.prefix}/approveSignDataOfOldUser`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.approveSignDataOfOldUser,
          //validateToken(logger),
          logger,
        ),
      );

      this.router.post(
        `/${this.prefix}/updateSignDataOfOldUser`,
        makeHandlerAwareOfAsyncErrors(
          this.controller.updateSignDataOfOldUser,
          //validateToken(logger),
          logger,
        ),
      );
      this.router.post(
        `/${this.prefix}/loginByDeveloper`,
        //validateToken(logger),
        makeHandlerAwareOfAsyncErrors(this.controller.loginByDeveloper, logger),
      );

      this.router.post(
        `/${this.prefix}/encryption`,
        //validateToken(logger),
        makeHandlerAwareOfAsyncErrors(this.controller.encryption, logger),
      );

      this.router.post(
        `/${this.prefix}/updateParentTreeList`,
        validateToken(logger),
        makeHandlerAwareOfAsyncErrors(
          this.controller.updateParentTreeList,
          logger,
        ),
      );
    }
  }
}

export default Route;
