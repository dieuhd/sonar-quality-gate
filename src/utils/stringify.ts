const isArray = (value: any) => Array.isArray(value);

const isObject = (value: any) =>
  Object.prototype.toString.call(value).slice(8, -1) === "Object";

const validate = (value: any) => {
  if (typeof value === "undefined") {
    throw new Error("This method requires one parameter");
  }

  if (!isArray(value) && !isObject(value)) {
    throw new TypeError("This method only accepts arrays and objects");
  }
};

const findRef = (ref: any, visitedRefs: any) =>
  Object.keys(visitedRefs).find((key) => visitedRefs[key] === ref);

export const decycle = (arg: any) => {
  validate(arg);

  const visitedRefs: any = {};

  const recurs = (value: any, path = "$") => {
    const ref = findRef(value, visitedRefs);
    if (ref) {
      return { $ref: ref };
    }
    if (isArray(value) || isObject(value)) {
      visitedRefs[path] = value;

      if (isArray(value)) {
        return value.map((elem: any, i: any) => recurs(elem, `${path}[${i}]`));
      }

      return Object.keys(value).reduce((accum: any, key: any) => {
        accum[key] = recurs(value[key], `${path}.${key}`);

        return accum;
      }, {});
    }
    return value;
  };
  return recurs(arg);
};