/* eslint-disable @typescript-eslint/ban-types */
export default interface CommonService {
  getAll?: Function;
  getById?: Function;
  create?: Function;
  update?: Function;
  remove?: Function;
}
