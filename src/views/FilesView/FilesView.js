import React from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../utils/API";
import {Alert, Col, Table} from "reactstrap";
import "../../utils/Global";
import FileOperations from "../Base/NewFolder/FileOperations";
import {DropTarget} from "react-dnd";
import FileComponent from "./FileComponent";
import {ItemTypes} from "./Constants";
import {toast} from "react-toastify";
import {addColonAtLast} from "../../utils/Tools";
import {connect} from "react-redux";
import {getFiles} from "../../actions/explorerActions";
import {compose} from "redux";
import {changePath, navigateUp} from "../../actions/explorerStateActions";


/*
* Start code for react DND
* */

const filesTarget = {
    drop(props, monitor, component) {
        if (monitor.didDrop()) return;

        let {Name, Path, IsDir, remoteName} = monitor.getItem();

        let srcRemoteName = addColonAtLast(remoteName);
        let srcRemotePath = Path;
        let destRemoteName = addColonAtLast(props.remoteName);
        let destRemotePath = props.remotePath;

        return {
            srcRemoteName,
            srcRemotePath,
            destRemoteName,
            destRemotePath,
            Name,
            IsDir,
            updateHandler: component.updateHandler
        }

    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    }
}

function renderOverlay() {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                zIndex: 1,
                opacity: 0.5,
                backgroundColor: 'gray',
            }}
        />
    );
}

/*
* END code for react DND
* */

function UpButtonComponent({upButtonHandle}) {
    return (
        <tr onClick={() => upButtonHandle()} className={"pointer-cursor"}>
            <td></td>
            <td><i className={"fa fa-file-o"}/> Go Up...</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>);
}

class FilesView extends React.PureComponent {


    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isDownloadProgress: false,
            downloadingItems: 0,
            shouldUpdate: true,

        };
        this.handleFileClick = this.handleFileClick.bind(this);
        this.downloadHandle = this.downloadHandle.bind(this);
        this.deleteHandle = this.deleteHandle.bind(this);
    }


    handleFileClick(e, item) {
        const {Path, IsDir, IsBucket} = item;
        if (IsDir || IsBucket) {
            this.updateRemotePath(Path, IsDir, IsBucket);
        } else {
            this.downloadHandle(item);
        }

    }

    updateRemotePath(newRemotePath, IsDir, IsBucket) {
        const {remoteName} = this.props.currentPath;

        let updateRemoteName = "";
        let updateRemotePath = "";


        if (IsBucket) {
            updateRemoteName = addColonAtLast(remoteName) + newRemotePath;
            updateRemotePath = "";
            // backStack.push({remoteName: addColonAtLast(backStack.peek().remoteName) + remotePath, remotePath: ""});

        } else if (IsDir) {
            updateRemoteName = remoteName;
            updateRemotePath = newRemotePath;
            // backStack.push({remoteName: backStack.peek().remoteName, remotePath: remotePath});
        }
        this.props.changePath(this.props.containerID, updateRemoteName, updateRemotePath);
    }


    getFilesList(showLoading = true) {
        const {remoteName, remotePath} = this.props.currentPath;

        this.props.getFiles(remoteName, remotePath);

    }

    async downloadHandle(item) {
        // let {remoteName, remotePath} = this.props;
        let {remoteName, remotePath} = this.props.currentPath;
        const {fsInfo} = this.props;
        let downloadUrl = "";
        if (fsInfo.Features.BucketBased) {
            downloadUrl = `/[${remoteName}]/${remotePath}/${item.Name}`;

        } else {
            downloadUrl = `/[${remoteName}:${remotePath}]/${item.Name}`;
        }

        this.setState((prevState) => {
            return {
                downloadingItems: prevState.downloadingItems + 1,
                isDownloadProgress: true
            };
        });

        let response = await axiosInstance({
            url: downloadUrl,
            method: 'GET',
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', item.Name);
        document.body.appendChild(link);
        link.click();

        this.setState((prevState) => {
            return {
                downloadingItems: prevState.downloadingItems - 1,
            };
        }, () => {
            if (this.state.downloadingItems === 0) {
                this.setState({isDownloadProgress: false})
            }
        });
    }

    async deleteHandle(item) {
        let {remoteName} = this.props.currentPath;

        const data = {
            fs: addColonAtLast(remoteName),
            remote: item.Path,
        };
        try {
            if (item.IsDir) {

                await axiosInstance.post("/operations/purge", data);

                this.updateHandler();
                toast.info(`${item.Name} deleted.`);

            } else {

                await axiosInstance.post("/operations/deletefile", data);
                this.updateHandler();
                toast.info(`${item.Name} deleted.`, {
                    autoClose: false
                });
            }
        } catch (e) {
            console.log(`Error in deleting file`);
            toast.error(`Error deleting file. ${e}`, {
                autoClose: false
            });
        }

    }

    updateHandler = () => {

        const {remoteName, remotePath} = this.props.currentPath;
        this.getFilesList(remoteName, remotePath);
    };

    dismissAlert = (e) => {
        this.setState({isDownloadProgress: false});
    };

    getFileComponents = (filesList, remoteName, isDir) => {
        return filesList.map((item, idx) => {
            let {ID, Name} = item;
            // Using fallback as fileName when the ID is not available (for local file system)
            if (ID === undefined) {
                ID = Name;
            }
            if (item.IsDir === isDir) {
                return (
                    <React.Fragment key={ID}>
                        <FileComponent item={item} clickHandler={this.handleFileClick}
                                       downloadHandle={this.downloadHandle} deleteHandle={this.deleteHandle}
                                       remoteName={remoteName}/>
                    </React.Fragment>
                )
            }
            return null;
        });
    };


    render() {
        const {isLoading, isDownloadProgress, downloadingItems,} = this.state;
        const {connectDropTarget, isOver, files, navigateUp, containerID} = this.props;
        const {remoteName} = this.props.currentPath;

        if (isLoading || !files) {
            return (<div><i className={"fa fa-circle-o-notch fa-lg"}/> Loading</div>);
        } else {


            if (remoteName === "") {
                return (<div>No remote is selected. Select a remote from above to show files.</div>);
            }


            let dirComponentMap = this.getFileComponents(files, remoteName, true);

            let fileComponentMap = this.getFileComponents(files, remoteName, false);

            const renderElement = (


                <React.Fragment>
                    <tr>
                        <td></td>
                        <th>Directories</th>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    {dirComponentMap}
                    <tr>
                        <td></td>
                        <th>Files</th>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    {fileComponentMap}
                </React.Fragment>

            );


            return connectDropTarget(
                <div className={"col-12"} style={{height: "100%"}}>
                    {isOver && renderOverlay()}

                    <Alert color="info" isOpen={isDownloadProgress} toggle={this.dismissAlert} sm={12}
                           lg={12}>
                        Downloading {downloadingItems} file(s). Please wait.
                    </Alert>

                    <Col sm={12}>
                        <FileOperations updateHandler={this.updateHandler} containerID={containerID}/>
                    </Col>


                    <Table sm={12} lg={12}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Modified</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <UpButtonComponent upButtonHandle={() => navigateUp(containerID)}/>
                        {files.length > 0 ? renderElement :
                            <tr>
                                <td></td>
                                <td>No files</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        }
                        </tbody>
                    </Table>
                </div>
            );
        }
    }

}

const propTypes = {
    // updateRemotePathHandle: PropTypes.func.isRequired,
    // upButtonHandle: PropTypes.func.isRequired,
    // remotePath: PropTypes.string.isRequired,
    containerID: PropTypes.string.isRequired
};

const defaultProps = {
    remotePath: "",
};


FilesView.propTypes = propTypes;
FilesView.defaultProps = defaultProps;


const mapStateToProps = (state, ownProps) => {
        const currentPath = state.explorer.currentPaths[ownProps.containerID];
        let fsInfo = {};
        const {remoteName, remotePath} = currentPath;


        if (currentPath && state.remote.configs && state.remote.configs[currentPath.remoteName]) {
            fsInfo = state.remote.configs[currentPath.remoteName];
        }

        let files = state.remote.files[`${remoteName}::${remotePath}`];
        if (files) {
            files = files.files;
        }

        return {
            files,
            currentPath,
            fsInfo
        }
    }

;

export default compose(
    DropTarget(ItemTypes.FILECOMPONENT, filesTarget, collect),
    connect(
        mapStateToProps, {getFiles, navigateUp, changePath}
    )
)(FilesView)
