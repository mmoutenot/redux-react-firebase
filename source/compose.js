import Firebase from 'firebase'
import * as Actions from './actions'

export default (config) => {
  return next => (reducer, initialState) => {
    const defaultConfig = {
      userProfile: 'users'
    }
    const store = next(reducer, initialState)

    const {dispatch} = store

    try {
      Firebase.initializeApp(config)
    } catch (err) {
      console.warn('Firebase error:', err)
    }

    const ref = Firebase.database().ref()

    const configs = Object.assign({}, defaultConfig, config)

    const firebase = Object.defineProperty(Firebase, '_', {
      value: {
        watchers: {},
        config: configs,
        authUid: null
      },
      writable: true,
      enumerable: true,
      configurable: true
    });


    const set = (path, value, onComplete) => ref.child(path).set(value, onComplete)
    const push = (path, value, onComplete) => ref.child(path).push(value, onComplete)
    const remove = (path, onComplete) => ref.child(path).remove(onComplete)
    const watchEvent = (eventName, eventPath) => Actions.watchEvent(firebase, dispatch, eventName, eventPath, true)
    const unWatchEvent = (eventName, eventPath, queryId = undefined) => Actions.unWatchEvent(firebase, eventName, eventPath, queryId)
    const login = credentials => Actions.login(dispatch, firebase, credentials)
    const logout = () => Actions.logout(dispatch, firebase)
    const createUser = (credentials, profile) => Actions.createUser(dispatch, firebase, credentials, profile)
    const resetPassword = (credentials) => Actions.resetPassword(dispatch, firebase, credentials)
    const changePassword = (credentials) => Actions.changePassword(dispatch, firebase, credentials)

    firebase.helpers = {
      set, push, remove,
      createUser,
      login, logout,
      resetPassword, changePassword,
      watchEvent, unWatchEvent
    }

    Actions.init(dispatch, firebase)

    store.firebase = firebase

    return store
  }
}
