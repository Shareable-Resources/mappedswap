import { Big } from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export interface InterestHistories {
    txTime: Mixed;
    address: string;
    name: string;
    token: string | null;
    amount: Mixed;
    rate: Mixed;
    interest: Mixed;
    totalInterest: Mixed;
    USDM: Big;
    ETHM: Big;
    BTCM: Big;
}
