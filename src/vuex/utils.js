
/**
 * 对象遍历，返回 value、key，具体处理由外部实现
 * @param {*} obj       需要遍历的对象
 * @param {*} callback  对当前索引的处理，又外部实现
 */
export const forEachValue = (obj, callback) =>{
  Object.keys(obj).forEach(key=>callback(obj[key],key));
}
