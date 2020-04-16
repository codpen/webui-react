import React from 'react';
import {Card, CardBody, Container} from "reactstrap";
import FilesView from "../FilesView/FilesView";
import {addColonAtLast} from "../../../utils/Tools";
import {connect} from "react-redux";
import * as PropTypes from 'prop-types';
import {
	changePath,
	changeRemoteName,
	changeRemotePath,
	createPath,
	navigateBack,
	navigateFwd,
	navigateUp
} from "../../../actions/explorerStateActions";
import FileOperations from "../../Base/FileOperations/FileOperations";
import {PROP_CURRENT_PATH, PROP_FS_INFO} from "../../../utils/RclonePropTypes";
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";
import RemotesList from "../RemotesList";


class RemoteExplorer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			remoteNameTemp: ""
		};

		this.updateRemoteName = this.updateRemoteName.bind(this);
		this.updateRemotePath = this.updateRemotePath.bind(this);
	}


	updateRemoteName(remoteName) {
		this.setState({remoteNameTemp: remoteName});
	}

	updateRemotePath(newRemotePath, IsDir, IsBucket) {
		const {remoteName} = this.props.currentPath;

		let updateRemoteName = "";
		let updateRemotePath = "";

		if (IsBucket) {
			updateRemoteName = addColonAtLast(remoteName) + newRemotePath;
			updateRemotePath = "";

		} else if (IsDir) {
			updateRemoteName = remoteName;
			updateRemotePath = newRemotePath;
		}
		this.props.changePath(this.props.containerID, updateRemoteName, updateRemotePath);
	}

	render() {


		const {remoteName} = this.props.currentPath;
		const {containerID, className} = this.props;

		const isValidPath = remoteName && remoteName !== "";

		return (
			<ErrorBoundary>

				<Card className={className}>
					<CardBody>
						<Container fluid={true}>

							{isValidPath ? (
								<>
									<FileOperations containerID={containerID}/>
									<FilesView containerID={containerID}/>
								</>
							) : (
								<RemotesList
									remoteName={remoteName}
									containerID={containerID}
								/>
							)}
						</Container>

					</CardBody>
				</Card>


			</ErrorBoundary>
		);


	}

}


const propTypes = {

	containerID: PropTypes.string.isRequired,
	createPath: PropTypes.func.isRequired,
	currentPath: PROP_CURRENT_PATH,
	fsInfo: PROP_FS_INFO,
	hasError: PropTypes.bool,
	distractionFreeMode: PropTypes.bool.isRequired,
	className: PropTypes.string

};

const defaultProps = {};

const mapStateToProps = (state, ownProps) => {

	const currentPath = state.explorer.currentPaths[ownProps.containerID];
	let fsInfo = {};

	const {remoteName} = currentPath;

	if (currentPath && state.remote.configs) {

		const tempRemoteName = remoteName.split(':')[0];
		if (state.remote.configs[tempRemoteName])

			fsInfo = state.remote.configs[tempRemoteName];
	}
	return {
		configs: state.remote.configs,
		hasError: state.remote.hasError,
		error: state.remote.error,
		currentPath,
		fsInfo,
	}

};

RemoteExplorer.propTypes = propTypes;
RemoteExplorer.defaultProps = defaultProps;

export default connect(
	mapStateToProps,
	{
		createPath, changePath,
		changeRemoteName, changeRemotePath, navigateUp,
		navigateBack, navigateFwd
	}
)(RemoteExplorer);
