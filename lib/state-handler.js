import { fromJS, Map, List } from 'immutable';
import { handleActions } from 'redux-actions';
import { get as lodashGet } from 'lodash';

import { apiTypes } from './redux-actions';

const storeMemory = (storage, name, data) => {
  if (storage[name]) {
    memoryDB[storage[name]] = JSON.stringify({ data });
  }
};

const loadMemory = (storage, name, defaultValue) => {
  if (storage[name]) {
    return JSON.parse(memoryDB[storage[name]] || '{}').data || defaultValue;
  }
  return defaultValue;
};

const defaultObject = {
  requesting: false,
  meta: {},
  error: {},
  data: {},
};

const apiStateHandlers = (states, storage, listValues) => {
  let actionHandlers = {};
  let initialState = {};
  states.forEach((state) => {
    const { type, name, apiField, append, prepend, update, remove, onSuccess, clear } = state;
    const types = apiTypes(type);
    const defaultValue = listValues.indexOf(name) === -1 ? {} : [];
    actionHandlers = {
      ...actionHandlers,
      // request
      [types[0]]: (state, action) => {
        const { payload } = action;
        if (action.noDispatch) {
          return state;
        }

        const newState = state
          .setIn([name, 'requesting'], true)
          .setIn([name, 'meta'], fromJS(payload.id ? { id: payload.id } : {}))
          .setIn([name, 'error'], fromJS({}));
        if (clear) {
          return newState.setIn([name, 'data'], fromJS(defaultValue));
        }
        return newState;
      },
      // success
      [types[1]]: (state, action) => {
        const payload = fromJS(
          apiField ? lodashGet(action.payload.data, apiField) : action.payload.data,
        ) || fromJS(defaultValue);
        const meta = fromJS(action.payload.meta);
        storeMemory(
          storage, name, apiField ? lodashGet(action.payload.data, apiField) : action.payload.data,
        );
        if (action.onSuccess) {
          setTimeout(() => action.onSuccess(payload.toJS()), 0);
        }

        if (action.noDispatch) {
          return state;
        }

        const newState = (onSuccess ? onSuccess(state, action) : state)
          .setIn([name, 'requesting'], false)
          .setIn([name, 'data'], payload)
          .setIn([name, 'meta'],
            meta || fromJS({
              total: action.payload && action.payload.data && action.payload.data.size,
            }));

        // used when creation is done
        if (append && payload.get('id')) {
          const existingItem = newState.getIn([append, 'data']).toJS().find(({ id }) => id === payload.get('id'));
          if (existingItem) {
            return newState.updateIn(
              [append, 'data'],
              list => list.map(item => (item.get('id') === payload.get('id') ? payload : item)),
            );
          }
          return newState.updateIn(
            [append, 'data'],
            list => (Map.isMap(list) && list.isEmpty() ? List([]) : list).push(payload),
          );
        }

        // used when creation is done
        if (prepend && payload.get('id')) {
          const existingItem = newState.getIn([prepend, 'data']).toJS().find(({ id }) => id === payload.get('id'));
          if (existingItem) {
            return newState.updateIn(
              [prepend, 'data'],
              list => list.map(item => (item.get('id') === payload.get('id') ? payload : item)),
            );
          }
          return newState.updateIn(
            [prepend, 'data'],
            list => (Map.isMap(list) && list.isEmpty() ? List([]) : list).unshift(payload),
          );
        }

        // used when update is done
        if (update && !payload.get('destroyed')) {
          return newState.updateIn(
            [update, 'data'],
            list => list.map(item => (item.get('id') === payload.get('id') ? payload : item)),
          );
        }
        // used when delete is done
        if (remove || payload.get('destroyed')) {
          return newState.updateIn(
            [remove || update, 'data'],
            list => list.filter(item => item.get('id') !== payload.get('id')),
          );
        }
        return newState;
      },
      // failure
      [types[2]]: (state, action) => {
        if (action.data) {
          const payload = fromJS(
            apiField ? lodashGet(action.data, apiField) : action.data,
          ) || fromJS(defaultValue);
          storeMemory(
            storage,
            name,
            apiField ? lodashGet(action.data, apiField) : action.payload.data,
          );
          state.setIn([name, 'data'], payload);
        }
        if (action.onFailure) {
          setTimeout(() => action.onFailure(), 0);
        }
        if (action.noDispatch) {
          return state;
        }

        return state
          .setIn([name, 'requesting'], false)
          .setIn([name, 'meta'], fromJS({}))
          .setIn([name, 'error'], fromJS(action.payload));
      },
      // clear
      [types[3]]: (state) => {
        storeMemory(storage, name, {});
        return state
          .setIn([name, 'requesting'], false)
          .setIn([name, 'meta'], fromJS({}))
          .setIn([name, 'data'], fromJS(defaultValue))
          .setIn([name, 'error'], fromJS({}));
      },
    };
    initialState = {
      ...initialState,
      [name]: {
        ...defaultObject,
        data: loadMemory(storage, name, defaultValue),
      },
    };
  });
  return { actionHandlers, initialState };
};

const instantStateHandlers = (states, storage, listValues) => {
  const actionHandlers = {};
  const initialState = {};
  states.forEach((state) => {
    const { type, name, kind } = state;
    const defaultData = listValues.indexOf(name) === -1 ? {} : [];
    const types = apiTypes(type);
    const defaultValue =
      kind === 'object'
        ? state.defaultValue || defaultData
        : state.defaultValue;
    // set
    actionHandlers[type] = (state, action) => {
      const value = action.payload || defaultValue;
      storeMemory(storage, name, value);
      if (kind === 'object') {
        return state.set(name, fromJS(value));
      }
      return state.set(name, value);
    };
    // clear
    actionHandlers[types[3]] = (state) => {
      storeMemory(storage, name, defaultValue);
      if (kind === 'object') {
        return state.set(name, fromJS(defaultValue));
      }
      return state.set(name, defaultValue);
    };
    const memoryValue = loadMemory(storage, name, defaultValue);
    initialState[name] = memoryValue;
  });
  return { actionHandlers, initialState };
};

const generateHandleActions = ({
  apiStates,
  instantStates = [],
  storage = {},
  listValues = [],
  customHandlers = {},
}) => {
  const apiHandlers = apiStateHandlers(apiStates, storage, listValues);
  const instantHandlers = instantStateHandlers(
    instantStates,
    storage,
    listValues,
  );
  return handleActions(
    {
      ...apiHandlers.actionHandlers,
      ...instantHandlers.actionHandlers,
      ...customHandlers,
    },
    fromJS({
      ...apiHandlers.initialState,
      ...instantHandlers.initialState,
    }),
  );
};

export default generateHandleActions;
