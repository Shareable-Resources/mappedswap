import express from 'express';
import {
  ContentTypeMiddleWare,
  timeMiddleware,
  accessControlAllowMiddleware,
  clientErrorHandler,
  redirectTo404IfRoutesNotFound,
} from '../../../foundation/server/Middlewares';
import router from '../route/0_index';
import logger from '../util/ServiceLogger';
import path from 'path';
import inspector from 'inspector';
import globalVar from '../const/globalVar';
const app = express();
app.use(accessControlAllowMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(timeMiddleware);
app.use(clientErrorHandler);
// Root route will display index.html which locates in dist/public if NODE_ENV is dev or local and in debug mode
// Otherwise only display 404 page
app.get('/', (req: any, res: any) => {
  const showApiEnv = ['dev', 'local'];
  const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'local';
  if (showApiEnv.includes(env)) {
    const isDebug = inspector.url();
    const apiHtml = isDebug
      ? path.resolve(__dirname + '../../../../../../public/index.html')
      : path.resolve(__dirname + '../../../../../dist/public/index.html');
    res.sendFile(apiHtml);
  } else {
    // Redirect to 404
    res.status(404).send('<h2>404 Not Found</h2>');
  }
});

for (const route of router) {
  app.use(route.getRouter());
}

//set 404 page for every non-existed route
app.use(redirectTo404IfRoutesNotFound(logger));
//Set Content Type
app.use(ContentTypeMiddleWare);
logger.info(
  `Express server [${globalVar.miningRewardsConfig.name}] started on port ${globalVar.miningRewardsConfig.express.port}. Try some routes, such as '/api/users'.`,
);

export const printRoutes = (server: express.Express) => {
  const routes: any[] = [];
  server._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      routes.push(middleware.route);
    } else if (middleware.name === 'router') {
      // router middleware
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          routes.push(route);
        }
      });
    }
  });

  routes.forEach((r) => {
    const methods: string[] = [];
    for (const key in r.methods) {
      methods.push(key.toUpperCase());
    }
    logger.info(
      `localhost:${globalVar.miningRewardsConfig.express.port}${
        r.path
      }  (${methods.join(',')})`,
    );
  });
};

export default app;
