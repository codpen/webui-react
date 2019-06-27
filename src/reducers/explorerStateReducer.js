import {
    CHANGE_GRID_MODE,
    CHANGE_PATH,
    CHANGE_REMOTE_NAME,
    CHANGE_REMOTE_PATH,
    CHANGE_SEARCH_QUERY,
    CHANGE_VISIBILITY_FILTER,
    CREATE_PATH,
    NAVIGATE_BACK,
    NAVIGATE_FWD,
    NAVIGATE_UP
} from "../actions/types";
import BackStack from "../utils/classes/BackStack";

const initialState = {
    backStacks: {},
    currentPaths: {},
    visibilityFilters: {},
    gridMode: {},
    searchQueries: {},
};

/**
 * Specifies the reducers for explorer state manipulation.
 * @param state {$ObjMap}
 * @param action {$ObjMap}
 * @returns {{currentPaths: {}, visibilityFilters: {}, gridMode: {}, searchQueries: {}, backStacks: {}}|({currentPaths, visibilityFilters, gridMode, searchQueries, backStacks}&{currentPaths: (initialState.currentPaths|{}), visibilityFilters: (initialState.visibilityFilters|{}), gridMode: (initialState.gridMode|{}), searchQueries: (initialState.searchQueries|{}), backStacks: (initialState.backStacks|{})})}
 */
export default function (state = initialState, action) {

    const id = action.id;
    // console.log(action.type);
    if (id) {

        let backStack = state.backStacks[id];
        // console.log(backStack, backStack instanceof BackStack);
        if (!backStack || !(backStack instanceof BackStack)) {
            // console.log("Creating new backstack");
            backStack = new BackStack();
        }


        // let arrayLen = array.length - 1 ;

        let remoteName = action.remoteName;
        let remotePath = action.remotePath;

        if (!remoteName) remoteName = "";
        if (!remotePath) remotePath = "";
        const data = {
            remoteName: remoteName,
            remotePath: remotePath
        };

        let visibilityFilter = state.visibilityFilters[id];
        let gridMode = state.gridMode[id];

        let searchQuery = "";


        switch (action.type) {
            case CHANGE_PATH:
                backStack.push(data);
                break;

            case CHANGE_REMOTE_NAME:
                // console.log("CHange remote name", remoteName, remotePath)
                if (remoteName.indexOf('/') === 0) {/*The name starts with a /: local Name*/
                    remotePath = remoteName;
                    remoteName = "/";

                } else {
                    remotePath = "";
                }
                backStack.empty();
                backStack.push({remoteName: remoteName, remotePath: remotePath});
                // ptr++;

                break;

            case CHANGE_REMOTE_PATH:
                backStack.push({remoteName: backStack.peek().remoteName, remotePath: remotePath});
                // ptr++;

                break;

            case CREATE_PATH:
                backStack = new BackStack();
                break;

            case NAVIGATE_UP:
                // TODO: Write logic for up, which will navigate one directory up
                let current = backStack.peek();
                console.log(current);

                if (current.remotePath && current.remotePath !== "") {
                    const splitPath = current.remotePath.split('/');
                    current.remotePath = "";
                    if (splitPath.length > 1)
                        for (let i = 0; i < splitPath.length - 1; i++) {
                            current.remotePath = current.remotePath + ((i !== 0) ? '/' : '') + splitPath[i];
                        }
                }
                console.log(current);
                backStack.push(current);
                break;

            case NAVIGATE_FWD:
                // if(ptr < array.length){
                //     ptr--;
                // }
                backStack.moveForward();
                break;

            case NAVIGATE_BACK:
                // console.log(backStack);
                backStack.moveBack();
                break;
            case CHANGE_VISIBILITY_FILTER:
                if (action.filter)
                    visibilityFilter = action.filter;
                break;
            case CHANGE_GRID_MODE:
                if (action.mode) {
                    gridMode = action.mode;
                }
                break;

            case CHANGE_SEARCH_QUERY:
                searchQuery = action.searchQuery;
                break;
            default:
                break;
        }
        // currentPath = backStack.peek();
        return {
            ...state,
            backStacks: {...state.backStacks, [id]: backStack},
            currentPaths: {...state.currentPaths, [id]: {...backStack.peek()}},
            visibilityFilters: {...state.visibilityFilters, [id]: visibilityFilter},
            gridMode: {...state.gridMode, [id]: gridMode},
            searchQueries: {...state.searchQueries, [id]: searchQuery}
        };
    } else {
        // console.error("ID is unexpectedly null");
        return state;
    }


};
