import * as actionTypes from '../../types/graphs'

const initialState = {
  showGraphActionWindow: false,
  graphsList: [],
}

function graphsDataReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_GRAPH_ACTION_WINDOW:
      return ({
        ...state,
        showGraphActionWindow: action.payload,
      })
    case actionTypes.ADD_GRAPH:
      return ({
        ...state,
        graphsList: [...state.graphsList, action.payload],
      })
    default:
      return state
  }
}

export default graphsDataReducer
