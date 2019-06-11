import axiosInstance from "../utils/API";
import {GET_CONFIG_FOR_REMOTE, GET_REMOTE_LIST, REQUEST_ERROR, REQUEST_SUCCESS} from "./types";

export const getConfigForRemote = (remoteName) => dispatch => {
    axiosInstance.post("operations/fsinfo", {fs: remoteName})
        .then((res) => dispatch({
                type: GET_CONFIG_FOR_REMOTE,
                status: REQUEST_SUCCESS,
                payload: {[remoteName]: res.data},

            }),
            error => dispatch({
                type: GET_CONFIG_FOR_REMOTE,
                status: REQUEST_ERROR,
                payload: error
            }))
}

export const getRemoteNames = () => dispatch => {
    axiosInstance.post("/config/listremotes").then(res => dispatch({
        type: GET_REMOTE_LIST,
        status: REQUEST_SUCCESS,
        payload: res.data.remotes
    }), error => dispatch({
        type: GET_REMOTE_LIST,
        status: REQUEST_ERROR,
        payload: error
    }))
}