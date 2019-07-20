import React from 'react';
import * as PropTypes from "prop-types";
import {PROP_CURRENT_PATH, PROP_FS_INFO} from "../../../utils/RclonePropTypes";
import VideoPlayer from "../../VideoPlayer/VideoPlayer";
import {IP_ADDRESS_KEY} from "../../../utils/Constants";
import {connect} from "react-redux";
import ImageLoader from "../ImageLoader/ImageLoader";
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";

export function isMedia(MimeType) {
    const mimeTypes = {
        "image/jpeg": "Image",
        "video/mp4": "Video"
    };
    return mimeTypes[MimeType];
}

class MediaWidget extends React.Component {


    getRenderForItem = () => {
        const {fsInfo, item, inViewport, currentPath} = this.props;
        const {remoteName, remotePath} = currentPath;
        const {MimeType} = item;

        let downloadURL = "";

        const ipAddress = localStorage.getItem(IP_ADDRESS_KEY);


        if (fsInfo.Features.BucketBased) {
            downloadURL = ipAddress + `[${remoteName}]/${remotePath}/${item.Name}`;

        } else {

            downloadURL = ipAddress + `[${remoteName}:${remotePath}]/${item.Name}`;

        }

        switch (MimeType) {


            case "image/jpeg":
                return (<ImageLoader item={item} downloadURL={downloadURL} inViewport={inViewport}/>);
            case "video/mp4":
                return (<VideoPlayer playbackURL={downloadURL} MimeType={MimeType} currentPath={currentPath}/>);

            default:
                return null;

        }
    };


    render() {
        const {loadMedia, item} = this.props;
        const {MimeType} = item;

        let element = isMedia(MimeType) && loadMedia ? (
            this.getRenderForItem()
        ) : null;
        return (
            <ErrorBoundary>
                {element}
            </ErrorBoundary>
        );
    }
}

MediaWidget.propTypes = {
    /**
     * Load or skip loading any media
     */
    loadMedia: PropTypes.bool.isRequired,
    /**
     * Item: Contains the referenced item
     */
    item: PropTypes.object.isRequired,
    /**
     * FS Information
     */
    fsInfo: PROP_FS_INFO.isRequired,
    /**
     * Current Path
     */
    currentPath: PROP_CURRENT_PATH.isRequired,
    /**
     * Container ID
     */
    containerID: PropTypes.string.isRequired,
    /**
     * InViewPort tells whether the component is in the user's view
     */
    inViewport: PropTypes.bool.isRequired


};

const mapStateToProps = (state, ownProps) => {
    const currentPath = state.explorer.currentPaths[ownProps.containerID];
    const loadMedia = state.explorer.loadImages[ownProps.containerID];

    let fsInfo = {};
    const {remoteName} = currentPath;

    if (currentPath && state.remote.configs) {

        const tempRemoteName = remoteName.split(':')[0];
        if (state.remote.configs[tempRemoteName])

            fsInfo = state.remote.configs[tempRemoteName];
    }
    return {
        currentPath,
        fsInfo,
        loadMedia
    }
};

export default connect(mapStateToProps, {})(MediaWidget);

