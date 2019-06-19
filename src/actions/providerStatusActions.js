import axiosInstance from "../utils/API/API";
import {addColonAtLast, isLocalRemoteName} from "../utils/Tools";
import {GET_REMOTE_ABOUT, REQUEST_ERROR, REQUEST_SUCCESS} from "../actions/types";

export const getAbout = (containerID) => {
    return (dispatch, getState) => {

        const state = getState();
        const currentPath = state.explorer.currentPaths[containerID];

        let {remoteName} = currentPath;

        if (remoteName) {
            if (!isLocalRemoteName(remoteName)) {
                remoteName = addColonAtLast(remoteName);
            }

            // Remove the previous data
            dispatch({
                type: GET_REMOTE_ABOUT,
                status: REQUEST_SUCCESS,
                id: containerID,
                payload: {}
            });

            axiosInstance.post("operations/about", {fs: remoteName})
                .then((res) => {
                    dispatch({
                        type: GET_REMOTE_ABOUT,
                        status: REQUEST_SUCCESS,
                        id: containerID,
                        payload: res.data
                    })
                }, (res) => {
                    dispatch({
                        type: GET_REMOTE_ABOUT,
                        status: REQUEST_ERROR,
                        id: containerID,
                        error: res
                    })
                })
        }
    }
};