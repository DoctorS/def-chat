import {SET_CURRENT_USER} from '../actions/types';

const initialState = {
    username: '',
}

export default function setUser(state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER:
            state = action.payload
        default:
            return state;
    }
    return state;
}
