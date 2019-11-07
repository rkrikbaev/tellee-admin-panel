import * as actionTypes from '../../types/user'

const initialState = {
  items: [2, 3],
  user: {},
}

function userDataReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ADD_USER:
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    default:
      return state
  }
}

export default userDataReducer
