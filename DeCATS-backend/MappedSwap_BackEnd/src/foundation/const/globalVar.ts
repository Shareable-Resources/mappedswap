import { DBConnection } from '../model/DBConnection';
import FoundationConfig from '../model/FoundationConfig';
const globalVar: {
  foundationConfig: FoundationConfig;
  dbConnection: DBConnection;
} = {
  foundationConfig: new FoundationConfig(),
  dbConnection: new DBConnection(),
};

export function initFoundationGlobalVar(foundationConfig: FoundationConfig) {
  globalVar.foundationConfig = foundationConfig;
}

export function initDBConnection(dbConnection: DBConnection) {
  globalVar.dbConnection = dbConnection;
}

export default globalVar;
