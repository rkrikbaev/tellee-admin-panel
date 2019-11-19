import * as actionTypes from '../../types/graphs'

const initialState = {
  defaultWidth: 620,
  defaultHeight: 350,
  showGraphActionWindow: false,
  graphsList: [{
    title: 'My Timerseries',
    type: 'timeseries',
    device: 'turbine',
    date: '360',
    parameter: 'Ambient_temp',
  }],
  isGraphDraggable: false,
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
    case actionTypes.TOGGLE_GRAPH_DRAGGING:
      return ({
        ...state,
        isGraphDraggable: action.payload,
      })
    default:
      return state
  }
}

export default graphsDataReducer
