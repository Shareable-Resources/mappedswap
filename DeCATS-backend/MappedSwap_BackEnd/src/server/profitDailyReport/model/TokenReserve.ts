import { Mixed } from '../../../foundation/types/Mixed';
import Token from '../../../general/model/dbModel/Token';

export interface TokenReserve {
  token: string;
  reserve: string;
  address: string;
  toUSDMExchangeRate: Mixed;
}

export interface TokenWithExchangeRate extends Token {
  toUSDMExchangeRate: Mixed;
}
