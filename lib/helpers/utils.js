export const dispatchMaker = methods => (dispatch) => {
  const methodsGroup = {};

  methods.forEach((method) => {
    methodsGroup[method[1]] = (...args) => dispatch(method[0](...args));
  });
  return methodsGroup;
};

export const dispatchRestMaker = (restActionsList = []) => {
  const methods = [];

  restActionsList.forEach(([restActions, name]) => {
    const capitalizedName = upperFirst(name);
    methods.push([restActions.create, `create${capitalizedName}`]);
    methods.push([restActions.update, `update${capitalizedName}`]);
    methods.push([restActions.list, `list${capitalizedName}s`]);
    methods.push([restActions.read, `read${capitalizedName}`]);
    methods.push([restActions.remove, `remove${capitalizedName}`]);
  });
  return dispatchMaker(methods);
};