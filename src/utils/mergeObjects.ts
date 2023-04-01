export type AnyObject = Record<string, any>;

export const mergeObjects = (obj1: AnyObject, obj2: AnyObject): AnyObject => {
  const result: AnyObject = {};
  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      const value1 = obj1[key];
      const value2 = obj2[key];
      if (typeof value1 === "object" && typeof value2 === "object") {
        result[key] = mergeObjects(value1, value2);
      } else if (Array.isArray(value1) && Array.isArray(value2)) {
        result[key] = value1.concat(value2);
      } else if (typeof value2 !== "undefined") {
        result[key] = value2;
      } else {
        result[key] = value1;
      }
    }
  }
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      const value1 = obj1[key];
      const value2 = obj2[key];
      if (typeof value2 !== "object" || typeof value1 === "undefined") {
        result[key] = value2;
      }
    }
  }
  return result;
};
