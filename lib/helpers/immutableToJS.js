/**
 * This HOC is used to convert the immutable objects held in the redux store into plain JS for
 * our React Components. For more information about this, please see this page in the redux docs:
 * http://redux.js.org/docs/recipes/UsingImmutableJS.html
 *
 * This HOC was directly extracted from these docs.
 */

import { Iterable } from 'immutable';
import React from 'react';

const immutableToJS = WrappedComponent => (wrappedComponentProps) => {
  const KEY = 0;
  const VALUE = 1;

  const propsJS = Object.entries(wrappedComponentProps)
    .reduce((newProps, wrappedComponentProp) => {
      // eslint-disable-next-line no-param-reassign
      newProps[wrappedComponentProp[KEY]] = Iterable.isIterable(wrappedComponentProp[VALUE])
        ? wrappedComponentProp[VALUE].toJS()
        : wrappedComponentProp[VALUE];
      return newProps;
    }, {});

  return <WrappedComponent {...propsJS} />;
};

export default immutableToJS;
