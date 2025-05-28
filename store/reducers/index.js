import { combineReducers } from 'redux';

// Sample reducer
const initialState = {
  assignments: [],
  tasks: [],
  loading: false,
  error: null
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ASSIGNMENTS':
      return {
        ...state,
        assignments: action.payload
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  app: appReducer
});

export default rootReducer;