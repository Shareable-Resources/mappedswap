import { Mixed } from '../types/Mixed';

export default class TreeHelper {
  /**
   * From flatten a tree
   * @param arr This array needs to be flattened to normal array
   * @param childrenKeyName The key of collections of child in every node, i.e. children
   */
  static flatten(arr: any[], childrenKeyName: string) {
    let newArr: any[] = [];
    for (let i = 0; i < arr.length; i++) {
      const children = arr[i][childrenKeyName];
      const pushObj = arr[i];
      if (children.length > 0) {
        newArr = newArr.concat(this.flatten(children, childrenKeyName));
        newArr.push(pushObj);
      } else {
        newArr.push(pushObj);
      }
    }
    return newArr;
  }
  /**
   * From flatten array to tree, flatten array should have a field(attribute) which refer to its parent
   * @param flattenArr This array needs to be converted to tree
   * @param idName Primary key, should be the parentKeyName self reference field name, i.e. id
   * @param childrenKeyName Whatevery you name it, it will become the key of collections of child in every node, i.e. children
   * @param parentKeyName The parent key name, i.e. parentId
   * @returns returns a tree of the array
   */
  static flattenToTree(
    flattenArr: any[],
    idName: string,
    childrenKeyName: string,
    parentKeyName: string,
  ) {
    const map: any = {};
    let node: any = undefined;
    const roots: any[] = [];
    let i;
    for (i = 0; i < flattenArr.length; i += 1) {
      map[flattenArr[i][idName]] = i; // initialize the map
      flattenArr[i][childrenKeyName] = []; // initialize the children
      flattenArr[i]['path'] = [flattenArr[i][idName]]; // initialize the children
    }

    for (i = 0; i < flattenArr.length; i += 1) {
      node = flattenArr[i];
      if (node[parentKeyName]) {
        // if you have dangling branches check that map[node.parentId] exists
        if (
          map[node[parentKeyName]] != null ||
          map[node[parentKeyName]] != undefined
        ) {
          flattenArr[map[node[parentKeyName]]][childrenKeyName].push(node);
          flattenArr[map[node[parentKeyName]]]['path'].push(node[idName]);
        }
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
  /**
   * Find a node from a tree
   * @param element This tree to be found
   * @param searchKey the key of an node which to be found in a tree, i.e id
   * @param searchValue the valid in the key of an node which to be found in a tree, i.e 1, means id= 1 would be found
   * @param parentKeyName The parent key name, i.e. parentId
   * @returns returns a tree of the array
   */
  static findNodeInTree(
    element: any,
    searchKey: string,
    searchValue: Mixed,
    childrenKey: string,
  ): any {
    if (element[searchKey] == searchValue) {
      return element;
    } else if (element[childrenKey] != null) {
      let i;
      let result = null;
      for (i = 0; result == null && i < element[childrenKey].length; i++) {
        result = this.findNodeInTree(
          element[childrenKey][i],
          searchKey,
          searchValue,
          childrenKey,
        );
      }
      return result;
    }
    return null;
  }
  /**
   * From flatten array to tree, flatten array should have a field(attribute) which refer to its parent
   * @param treeRoot This tree needs to be traversed
   * @param idName Primary key, should be the parentKeyName self reference field name, i.e. id
   * @param childrenKeyName Whatevery you name it, it will become the key of collections of child in every node, i.e. children
   * @param parentKeyName The parent key name, i.e. parentId
   * @returns returns a tree of the array
   */
  static sumNodes(
    treeRoot: any,
    childrenKeyName: string,
    sumKeyName: string,
    dataKeyToBeSum: string,
  ) {
    treeRoot[sumKeyName] = treeRoot[sumKeyName] ? treeRoot[sumKeyName] : 0;
    if (treeRoot.children) {
      treeRoot.children.forEach((child) => {
        treeRoot[sumKeyName] += TreeHelper.sumNodes(
          child,
          childrenKeyName,
          sumKeyName,
          dataKeyToBeSum,
        );
      });
    }
    return treeRoot[sumKeyName] + Number(treeRoot[dataKeyToBeSum]);
  }

  /**
   * Move a node from children to its parent siblings
   * @param treeRoot This tree to be found
   * @param childrenKeyName the key of an node which to be found in a tree, i.e id
   * @param parentKeyName the valid in the key of an node which to be found in a tree, i.e 1, means id= 1 would be found
   * @returns returns a tree of the array
   */
  static moveUpwardsBasedOnNodeField(
    treeRoot: any,
    childrenKeyName: string,
    parentKeyName: string,
  ) {}
}
