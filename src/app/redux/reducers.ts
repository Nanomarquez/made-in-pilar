import { combineReducers } from 'redux';
import auth from './auth/authSlice'
import global from './global/globalSlice'

const reducers = combineReducers({
  auth,
  global
});

export default reducers;
