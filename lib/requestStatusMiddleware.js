import invariant from 'invariant';
import { get } from 'lodash';

/**
 * requestStatusMiddleware takes an API Request action and handles updating the state
 * when requesting as well as dispatching actions for success and failure cases.
 */
export default function requestStatusMiddleware({ dispatch }) {
  return opts => next => async (action) => {
    const {
      types,
      apiCall,
      payload = {},
      onSuccess,
      onFailure,
      notification,
      args,
      noDispatch, /** Sends api request without affecting redux */
    } = action;

    if (!opts.requestMiddleware) {
      opts.requestMiddleware = {
        responseDataPath: 'body'
      }
    }

    // requestStatusMiddleware requires 3 action types, *_REQUEST, *_SUCCESS, *_FAILURE.
    // If the `types` key is absent, pass this action along to the next middleware.
    if (!types) {
      return next(action);
    }

    // The `types` key must be an array of 3 strings. If not, throw an error.
    invariant(
      Array.isArray(types) &&
        types.length === 3 &&
        types.every(type => typeof type === 'string'),
      'requestStatusMiddleware expected `types` to be an array of 3 strings',
    );

    // The `apiCall` key must be a function.
    invariant(
      typeof apiCall === 'function',
      'requestStatusMiddleware expected `apiCall` to be a function',
    );
    const showError = !(notification && notification.noError);
    const [requestType, successType, failureType] = types;

    dispatch({ type: requestType, payload, noDispatch });

    const data = await apiCall(...args);
    const { response, error } = data || { error: 'empty' };
    const responseData = get(response, `${opts.requestMiddleware.responseDataPath}`);
    if (responseData) {
      dispatch({
        data: responseData,
        type: successType,
        error: false,
        payload: responseData,
        request: payload,
        onSuccess,
        noDispatch,
      })
    }
    // if (response && (error || !response.body) && showError) {
    //   dispatch({
    //     data: response.body.data,
    //     type: failureType,
    //     error: true,
    //     payload: error,
    //     request: payload,
    //     onFailure,
    //     noDispatch,
    //   });

    //   if (error.title || error.detail) {
    //     dispatch({
    //       type: GLOBAL_NOTIFICATION,
    //       payload: {
    //         data: error,
    //         kind: 'error',
    //       },
    //     });
    //   } else {
    //     dispatch({
    //       type: GLOBAL_NOTIFICATION,
    //       payload: {
    //         data: {
    //           title: startCase(last(requestType.split('/'))),
    //           detail: error,
    //         },
    //         kind: 'error',
    //       },
    //     });
    //   }
    // } else if (response && response.body.status === 'error' && showError) {
    //   const error = {
    //     title: 'Error',
    //     detail: response.body.message,
    //   };

    //   dispatch({
    //     type: failureType,
    //     data: response.body.data,
    //     error: true,
    //     payload: error,
    //     request: payload,
    //     onFailure,
    //     noDispatch,
    //   });

    //   dispatch({
    //     type: GLOBAL_NOTIFICATION,
    //     payload: {
    //       data: error,
    //       kind: 'error',
    //     },
    //   });
    // } else {
    //   if (response) {
    //     dispatch({
    //       type: successType,
    //       payload: response.body,
    //       request: payload,
    //       onSuccess,
    //       noDispatch,
    //     });
    //   } else {
    //     dispatch({
    //       type: successType,
    //       payload: '{}',
    //       request: payload,
    //       onSuccess,
    //       noDispatch,
    //     });
    //   }

    //   if (notification && (notification.title || notification.detail)) {
    //     dispatch({
    //       type: GLOBAL_NOTIFICATION,
    //       payload: {
    //         data: notification,
    //         kind: 'success',
    //       },
    //     });
    //   } else if (response && response.body.message) {
    //     dispatch({
    //       type: GLOBAL_NOTIFICATION,
    //       payload: {
    //         data: {
    //           title: 'Success',
    //           detail: response.body.message,
    //         },
    //         kind: 'success',
    //       },
    //     });
    //   }
    // }
    return true;
  };
}
