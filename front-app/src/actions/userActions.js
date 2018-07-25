import axios from "axios";
import { SET_CURRENT_USER, GET_ERRORS } from "./types";

export const setCurrentUser = user => dispatch => {
  if (!user.username) user.username = "";
  if (localStorage) localStorage.username = user.username;
  dispatch({
    type: SET_CURRENT_USER,
    payload: user
  });
};

export const registerUser = userData => dispatch => {
  axios
    .post("/register-test", userData)
    .then(r => dispatch(setCurrentUser({ username: r.data.username })))
    .catch(e =>
      dispatch({
        type: GET_ERRORS,
        payload: e.response.data
      })
    );
};

export const authUser = userData => dispatch => {
  if (!userData.email || !userData.password) return;
  axios
    .post("/auth-test", userData)
    .then(r => dispatch(setCurrentUser({ username: r.data.username })))
    .catch(e =>
      dispatch({
        type: GET_ERRORS,
        payload: e.response.data
      })
    );
};
