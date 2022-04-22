export class AxiosHelper {
  static convertObjKeysToQueryString(obj: any) {
    let queryStart = '?';
    const queryStrings: string[] = [];
    for (const element of Object.keys(obj)) {
      if (obj[element]) {
        queryStrings.push(`${element}=${obj[element]}`);
      }
    }
    if (!queryStrings) {
      queryStart = '';
    }
    return queryStart + queryStrings.join(',');
  }
}
