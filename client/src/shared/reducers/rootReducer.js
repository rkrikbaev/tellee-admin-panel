import { combineReducers } from 'redux'
import user from './user'
import graphs from './graphs'

export default combineReducers({
  users: user,
  graph: graphs,
})
