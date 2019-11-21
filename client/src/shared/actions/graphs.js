import * as actionTypes from '../../types/graphs'

// eslint-disable-next-line import/prefer-default-export
export const graphActionWindow = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.SHOW_GRAPH_ACTION_WINDOW,
    payload: data,
  })
}

export const addGraphConfigAction = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.ADD_GRAPH_CONFIG,
    payload: data,
  })
}

export const toggleGraphDraggingAction = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.TOGGLE_GRAPH_DRAGGING,
    payload: data,
  })
}

const addGraphDataActionSuccess = (data) => ({
  type: actionTypes.DATA_RECIEVE_SUCCESS,
  payload: [
    ...data,
  ],
})

const addGraphDataActionStarted = () => ({
  type: actionTypes.DATA_REQUEST_STARTED,
})

const addGraphDataActionFailure = (error) => ({
  type: actionTypes.DATA_RECIEVE_FAILURE,
  payload: {
    error,
  },
})

export const addGraphDataAction = (data) => (dispatch) => {
  dispatch(addGraphDataActionStarted())

  const { device, date, parameter } = data
  fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/data/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify({ device, date: date * 3600000, parameter }),
  })
    .then((resp) => resp.json())
    .then((resp) => {
      const validData = resp.map((item) => ({
        name: new Date(item.time * 1000).toLocaleTimeString().replace(' AM', '').replace(' PM', ''),
        [parameter]: item[parameter],
      }))
      return dispatch(addGraphDataActionSuccess(validData))
    })
    .catch((err) => dispatch(addGraphDataActionFailure(err)))
}
