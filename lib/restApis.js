/* istanbul ignore file */
import { get, post, put, del } from 'redux/fetch';

export const apiBaseRoute = process.env.API_BASE_URL;

const performAction = method => (...models) => {
  if (models.length > 1) {
    return (...args) => performAction(method)(`${models[0]}/${args[0]}/${models[1]}`, ...models.slice(2))(...args.slice(1));
  }
  const model = models[0];
  switch (method) {
    case 'create':
      return payload => post(`${apiBaseRoute}/${model}`, { requestBody: payload });
    case 'update':
      return (id, payload) => put(`${apiBaseRoute}/${model}${id ? `/${id}` : ''}`, { requestBody: payload });
    case 'remove':
      return (id, payload) => del(`${apiBaseRoute}/${model}${id ? `/${id}` : ''}`, { requestBody: payload });
    case 'read':
      return (id, query) => get(`${apiBaseRoute}/${model}${id ? `/${id}` : ''}`, query);
    case 'multiRemove':
      return query => del(`${apiBaseRoute}/${model}`, { query });
    case 'list':
    default:
      return query => get(`${apiBaseRoute}/${model}`, query);
  }
};

export default (...models) => ({
  create: performAction('create')(...models),
  update: performAction('update')(...models),
  remove: performAction('remove')(...models),
  multiRemove: performAction('multiRemove')(...models),
  list: performAction('list')(...models),
  read: performAction('read')(...models),
});
