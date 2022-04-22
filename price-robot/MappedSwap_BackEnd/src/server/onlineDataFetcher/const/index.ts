import serverConfigJSON from '../../../config/OnlineDataFetcherConfig.json';
const serviceConfigName = 'OnlineDataFetcherConfig';
const serverConfig =
  serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const serverName = serverConfig.name;
export { serverName, serviceConfigName };
