import BN from 'bn.js';
import CommissionDistribution from '../../../general/model/dbModel/CommissionDistribution';
import CommissionSummary from '../../../general/model/dbModel/CommissionSummary';

export default interface ParamPayoutUpdate {
  roundID: number | string | BN;
  tokenList: string[];
  agentPayoutList: [string, (number | string | BN)[]][];
  summaries: CommissionSummary[];
  distributions: CommissionDistribution[];
}
