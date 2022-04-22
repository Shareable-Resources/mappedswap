import { AbiItem } from 'web3-utils';
import globalVar from './globalVar';

const serviceConfigName = 'MiningRewardsServerConfig';
const serverName = globalVar.miningRewardsConfig.name;
const defaultAgentId = 1;

const createdEventApi: AbiItem = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: 'uint256',
      name: 'roundID',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'creator',
      type: 'address',
    },
  ],
  name: 'Created',
  type: 'event',
};

const addLockedStakingEventApi: AbiItem = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: 'address',
      name: 'userAddr',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'stakeAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'stakeRewardsAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint64',
      name: 'stakeTime',
      type: 'uint64',
    },
    { indexed: false, internalType: 'uint64', name: 'nodeID', type: 'uint64' },
    {
      indexed: false,
      internalType: 'bytes32',
      name: 'stakeHash',
      type: 'bytes32',
    },
  ],
  name: 'StakeRewards',
  type: 'event',
};

export {
  createdEventApi,
  addLockedStakingEventApi,
  serverName,
  serviceConfigName,
  defaultAgentId,
};
