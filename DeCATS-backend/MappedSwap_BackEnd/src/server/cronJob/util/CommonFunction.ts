import Big from 'big.js';
import AgentDailyReport, {
  AgentDailyReportType,
} from '../../../general/model/dbModel/AgentDailyReport';
export function calculateRootAgentIncome(
  dbRecords: AgentDailyReport[],
  hasMSTRate: boolean,
) {
  for (let i = 0; i < dbRecords.length; i++) {
    //Root agent
    if (!dbRecords[i].parentAgentId) {
      const distMSTTokenOfSubAgents = dbRecords
        .filter(
          (x: AgentDailyReport) =>
            x.token == dbRecords[i].token &&
            x.agentId != dbRecords[i].agentId &&
            x.distType == dbRecords[i].distType,
        )
        .map((report) => {
          return {
            distToken: report.distToken,
            distTokenInUSDM: report.distTokenInUSDM,
          };
        });

      let sumOfDistTokenInUSDM = new Big(0);
      distMSTTokenOfSubAgents.forEach((x) => {
        sumOfDistTokenInUSDM = sumOfDistTokenInUSDM.plus(
          new Big(x.distTokenInUSDM!.toString()),
        );
      });
      // So for MST, because it is expense, that' s why need to mul by -1
      if (dbRecords[i].distType == AgentDailyReportType.MST) {
        const distMSTTokenInUSDM = new Big(sumOfDistTokenInUSDM)
          .mul(-1)
          .toString();
        dbRecords[i].distTokenInUSDM = distMSTTokenInUSDM;
      }
      // dist Token for MST only avaible when MST rate is provided
      if (hasMSTRate) {
        let sumOfDistToken = new Big(0);
        distMSTTokenOfSubAgents.forEach((x) => {
          sumOfDistToken = sumOfDistToken.plus(
            new Big(x.distToken!.toString()),
          );
        });
        if (dbRecords[i].distType == AgentDailyReportType.MST) {
          const distMSTToken = new Big(sumOfDistToken).mul(-1).toString();
          dbRecords[i].distToken = distMSTToken;
        }
      }
    }
  }

  return dbRecords;
}
