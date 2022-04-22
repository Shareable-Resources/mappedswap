import serverConfigJSON from '../../config/DecatsServerConfig.json';

const serverConfig =
  serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const serviceConfigName = 'DecatsServerConfig';
const serverName = serverConfig.name;
export { serverName, serviceConfigName };
