export default class ArrayHelper {
  static findDuplicates(arr: any[], key: string) {
    const sortedArr: any = this.sortByKey(arr.slice(), key); // You can define the comparing function here.
    // JS by default uses a crappy string compare.
    // (we use slice to clone the array so the
    // original array won't be modified)
    const results: any = [];
    for (let i = 0; i < sortedArr.length - 1; i++) {
      if (sortedArr[i + 1][key] == sortedArr[i][key]) {
        results.push(sortedArr[i][key]);
      }
    }
    return results;
  }
  static sortByKey(array: any[], key: string, casting?: 'Number' | 'string') {
    if (casting == 'Number') {
      return array.sort((a, b) => {
        const x = a[key];
        const y = b[key];
        return Number(x) < Number(y) ? -1 : Number(x) > Number(y) ? 1 : 0;
      });
    } else {
      return array.sort((a, b) => {
        const x = a[key];
        const y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
      });
    }
  }
  static filterByValue(array: any[], string: string) {
    return array.filter((o) => {
      return Object.keys(o).some((k: any) => {
        let value = o[k];
        if (typeof value == 'number') {
          value = value.toString();
        }
        if (typeof value === 'string')
          return value.toLowerCase().includes(string.toLowerCase());
        return value;
      });
    });
  }
  static groupBy(xs: any[], key: string) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
  static min(arr: any[]) {
    return arr.reduce((p, v) => {
      return p < v ? p : v;
    });
  }

  static max(arr: any[]) {
    return arr.reduce((p, v) => {
      return p > v ? p : v;
    });
  }
  static sum(arr: any[]) {
    return arr.length > 0 ? arr.reduce((a: any, b: any) => a + b) : 0;
  }
  static splitInChunks(arr: any[], chunkSize: number) {
    const chunksOfObj: any[] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      chunksOfObj.push(chunk);
    }
    return chunksOfObj;
  }
}
