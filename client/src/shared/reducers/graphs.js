import * as actionTypes from '../../types/graphs'

const initialState = {
  defaultWidth: 620,
  defaultHeight: 350,
  showGraphActionWindow: false,
  isGraphDraggable: false,
  graphsConfigList: [
    {
      title: 'My Ambient',
      type: 'timeseries',
      device: 'turbine',
      date: '24',
      parameter: 'Ambient_temp',
    },
    {
      title: 'My Inlete',
      type: 'timeseries',
      device: 'turbine',
      date: '24',
      parameter: 'Inlete_temp',
    },
  ],
  graphsData: [],
  loading: false,
  error: null,
}

function graphsDataReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_GRAPH_ACTION_WINDOW:
      return ({
        ...state,
        showGraphActionWindow: action.payload,
      })
    case actionTypes.ADD_GRAPH_CONFIG:
      return ({
        ...state,
        graphsConfigList: [...state.graphsConfigList, action.payload],
      })
    case actionTypes.TOGGLE_GRAPH_DRAGGING:
      return ({
        ...state,
        isGraphDraggable: action.payload,
      })
    case actionTypes.DATA_REQUEST_STARTED:
      return ({
        ...state,
        loading: true,
      })
    case actionTypes.DATA_RECIEVE_SUCCESS:
      return ({
        ...state,
        loading: false,
        error: null,
        graphsData: [...state.graphsData, action.payload],
      })
    case actionTypes.DATA_RECIEVE_FAILURE:
      return ({
        ...state,
        loading: false,
        error: action.payload.error,
      })
    default:
      return state
  }
}

export default graphsDataReducer
