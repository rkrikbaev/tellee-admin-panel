import * as actionTypes from '../../types/graphs'

// eslint-disable-next-line import/prefer-default-export
export const graphActionWindow = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.SHOW_GRAPH_ACTION_WINDOW,
    payload: data,
  })
}

export const addGraphAction = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.ADD_GRAPH,
    payload: data,
  })
}

export const toggleGraphDraggingAction = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.TOGGLE_GRAPH_DRAGGING,
    payload: data,
  })
}
