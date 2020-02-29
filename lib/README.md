# Includes

Redux Files

## Folders / Files

### Tree

+feature1  
  actions.js  
  reducer.js  
+feature2  
  actions.js  
  reducer.js  
...  
apiEndpoints.js  
constants.js  
fetch.js  
localStorage.js  
reducer.js  
redux-api-actions.js  
requestStatusMiddleware.js  
restApi.js  
sagas.js  
selectors.js  
state-handler.js  
store.js  

### Files Description

`feature#N` folder is to keep redux related files(actions.js, reducer.js) feature by feature.  
`apiEndpoints.js` defines some api endpoints which are specific. The common rest api endpoints are not defined here (`restApis.js` has a smart way).  
`constants.js` defines the constants of all the actions.  
`fetch.js` defines some api modules for various requests (get, post, put, del)  
`localStorage.js` has nothing but the function to define memoryStorage according to the browser support. (usually localStorage but sometimes it can be MemoryStorage instance)  
`reducer.js` is to combine all reducers from features.  
`redux-api-actions.js` is to create a smart api action to help a development.  
`requestStatusMiddleware.js` takes an API Request action and handles updating the state.  
`restApis.js` give a way to get common ret api endpoints per feature.  
`sagas.js` combines all sagas (for now it is not used but will consider later).  
`selectors.js` gives a smart way to select the redux states (selector, dataSelector, requestingSelector, errorSelector, selectState).  
`state-handlers.js` provides stateHandlers for the common reducer functionalities to be performed. It has a very smart way to keep the consistent format of success/failure/request actions/reducers.  
`store.js` configures the store.  
