/* istanbul ignore file */
import invariant from 'invariant';
import { createAction as reduxCreateAction } from 'redux-actions';
import { isFunction, omit } from 'lodash';

/* istanbul ignore file */
import restApis from './restApis';

export const createAction = reduxCreateAction;

export const apiTypes = type => [`${type}_REQUEST`, `${type}_SUCCESS`, `${type}_FAILURE`, `${type}_CLEAR`];

export const createClearAction = type => reduxCreateAction(`${type}_CLEAR`);

/**
 * Create an action creator that creates actions with types and apiCall keys. Heavily inspired
 * by the createAction function found in redux-actions
 * @param  {Array} types             An array of types that will be called based on api
 *                                   request. Must be in the following order:
 *                                   REQUEST, SUCCESS, FAILURE
 * @param  {Function} apiCall        A function that returns a promise.
 * @param  {Function} payloadCreator A function that defines how the payload is created.
 * @param  {Function} metaCreator    A function that defines how any meta data is created.
 * @return {Function} A function that creates actions.
 */
export function createApiAction(
  type,
  apiCall,
  notification = null,
  metaCreator,
) {
  const types = apiTypes(type).slice(0, 3);
  invariant(isFunction(apiCall), 'Expected apiCall to be a function');

  const hasMeta = isFunction(metaCreator);

  const actionCreator = (...args) => {
    const payload = args[args.length - 1];
    const action = { types, apiCall, notification, args };
    if (payload instanceof Error) {
      action.error = true;
    }

    if (payload !== undefined) {
      action.payload = omit(payload, ['onSuccess', 'onFailure', 'noDispatch']);
      action.onSuccess = payload.onSuccess;
      action.onFailure = payload.onFailure;
      action.noDispatch = payload.noDispatch;
    }

    if (hasMeta) {
      action.meta = metaCreator(...args);
    }
    return action;
  };

  return actionCreator;
}

export const restApiActions = (...models) => {
  const apis = restApis(...models);
  const reducerName = models.join('/');

  return ({
    create: createApiAction(`${reducerName}_CREATE`, apis.create),
    list: createApiAction(`${reducerName}_LIST`, apis.list),
    read: createApiAction(`${reducerName}_READ`, apis.read),
    remove: createApiAction(`${reducerName}_REMOVE`, apis.remove),
    update: createApiAction(`${reducerName}_UPDATE`, apis.update),
  });
};

export const restApiStates = (models, name, update = true, remove = true, isClear = false) => {
  const reducerName = models.join('/');
  return [
    { type: `${reducerName}_CREATE`, name, append: `${name}s` },
    { type: `${reducerName}_LIST`, name: `${name}s`, clear: isClear },
    { type: `${reducerName}_UPDATE`, name, update: update && `${name}s` },
    { type: `${reducerName}_READ`, name, update: update && `${name}s` },
    { type: `${reducerName}_REMOVE`, name, remove: remove && `${name}s`, update: !remove && `${name}s` },
  ];
};
