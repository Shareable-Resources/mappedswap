import { Mixed } from '../../../foundation/types/Mixed';
import Token from '../../../general/model/dbModel/Token';

export interface TokenWithExchangeRate extends Token {
  toUSDMExchangeRate: Mixed;
}
