import * as actionTypes from '../../types/user'

// eslint-disable-next-line import/prefer-default-export
export const addUser = (data) => (dispatch) => {
  dispatch({
    type: actionTypes.ADD_USER,
    payload: data, // action payload
  })
}
