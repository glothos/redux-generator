/* istanbul ignore file */
import { createSelector } from 'reselect';

export const selectors = (reducer, name) => {
  const reducerSelector = state => state.get(reducer);
  const propertySelector = createSelector(reducerSelector, state =>
    state.get(name),
  );

  const dataSelector = createSelector(propertySelector, state =>
    state.get('data'),
  );

  const requestingSelector = createSelector(propertySelector, state =>
    state.get('requesting'),
  );

  const errorSelector = createSelector(propertySelector, state =>
    state.get('error'),
  );

  return {
    propertySelector,
    dataSelector,
    requestingSelector,
    errorSelector,
  };
};

export const getSelector = (reducer, name) => {
  const reducerSelector = state => state.get(reducer);
  return createSelector(reducerSelector, state => state.get(name));
};

export const getDataSelector = (reducer, name) => {
  const propertySelector = getSelector(reducer, name);
  return createSelector(propertySelector, state => state.get('data'));
};

export const getRequestingSelector = (reducer, name) => {
  const propertySelector = getSelector(reducer, name);
  return createSelector(propertySelector, state => state.get('requesting'));
};

export const getErrorSelector = (reducer, name) => {
  const propertySelector = getSelector(reducer, name);
  return createSelector(propertySelector, state => state.get('error'));
};

export const getMetaSelector = (reducer, name) => {
  const propertySelector = getSelector(reducer, name);
  return createSelector(propertySelector, state => state.get('meta'));
};

export const selectState = (reducer, name) => (state, objectName = name) => ({
  [objectName]: getDataSelector(reducer, name)(state),
  [`${objectName}Requesting`]: getRequestingSelector(reducer, name)(state),
  [`${objectName}Error`]: getErrorSelector(reducer, name)(state),
  [`${objectName}Meta`]: getMetaSelector(reducer, name)(state),
});
