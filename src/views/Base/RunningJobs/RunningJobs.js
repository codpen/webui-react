import React from 'react';
import {Card, CardBody, CardHeader, Col, Progress, Row} from "reactstrap";
import {bytesToMB, formatBytes, secondsToStr} from "../../../utils/Tools";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Line} from "react-chartjs-2";
import {CustomTooltips} from "@coreui/coreui-plugin-chartjs-custom-tooltips";

const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
}
function JobCard({job}) {
    const {name, eta, percentage, speed, speedAvg, size, bytes} = job;
    return (<Card>
        <CardHeader>Running Jobs</CardHeader>
        <CardBody>
            <p>{name}</p> {/*Name of the file*/}
            <Progress value={percentage} className={"mb-2"}>{percentage} %</Progress> {/*percentage*/}
            <p><strong>Speed: </strong>{formatBytes(speed)}PS</p> {/*speed*/}
            <p><strong>Average Speed: </strong>{formatBytes(speedAvg)}PS</p> {/*speedAvg*/}
            <p><strong>Total transferred: </strong>{formatBytes(bytes)}</p> {/*bytes: convert to mb*/}
            <p><strong>Size: </strong>{formatBytes(size)}</p>
            <p><strong>ETA: </strong>{secondsToStr(eta)} seconds</p>
        </CardBody>

    </Card>);
}

function JobCardRow({job}) {
    const {name, percentage, speed, size} = job;
    return (
        <React.Fragment>
            <Row>
                {(size && speed) ? (<Col lg={12}>{name}({formatBytes(size)}) - {formatBytes(speed)}PS </Col>) : (
                    <Col lg={12}>Calculating</Col>)}

            </Row>
            <Row>
                <Col lg={12}><Progress value={percentage} className={"mb-2"}>{percentage} %</Progress></Col>
            </Row>

        </React.Fragment>
    );

}

function GlobalStatus({stats}) {
    const {speed, bytes, checks, elapsedTime, deletes, errors, transfers} = stats;
    return (
        <Card>
            <CardHeader><strong>Global Stats</strong></CardHeader>
            <CardBody>
                <p><strong>Bytes Transferred: </strong>{formatBytes(bytes)}</p>
                <p><strong>Average Speed: </strong>{formatBytes(speed)}PS</p>
                <p><strong>Checks: </strong>{checks}</p>
                <p><strong>Deletes: </strong>{deletes}</p>
                <p><strong>Running since: </strong>{secondsToStr(elapsedTime)}</p>
                <p><strong>Errors: </strong>{errors}</p>
                <p><strong>Transfers: </strong>{transfers}</p>

            </CardBody>
            {/*<CardFooter></CardFooter>*/}

        </Card>);

}

function TransferringJobs({transferring}) {
    if (transferring !== undefined) {
        return transferring.map((item, idx) => {
            return (<JobCard key={idx} job={item}/>);
        });
    }
    return null;
}

function TransferringJobsRow({transferring}) {
    if (transferring !== undefined) {
        return transferring.map((item, idx) => {
            return (<JobCardRow key={idx} job={item}/>);
        });
    }
    return null;
}


class RunningJobs extends React.Component {


    render() {
        const {jobs, isConnected, lineChartData} = this.props;
        const {transferring} = jobs;
        const {mode} = this.props;
        if (mode === "full-status") {
            if (isConnected) {
                return (
                    <Row>
                        <Col sm={12} lg={4}>
                            <GlobalStatus stats={jobs}/>
                        </Col>
                        <Col sm={12} lg={4}>
                            <TransferringJobs transferring={transferring}/>
                        </Col>
                        <Col sm={12} lg={4}>
                            <Card>
                                <CardHeader>
                                    Speed
                                    <div className="card-header-actions">
                                        <a href="http://www.chartjs.org" className="card-header-action">
                                            <small className="text-muted">docs</small>
                                        </a>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-wrapper">
                                        <Line data={lineChartData} options={options}/>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                );
            } else {
                return (<div>Not connected to rclone.</div>)
            }

        } else if (mode === "card") {
            if (isConnected) {
                return (

                    <TransferringJobsRow transferring={transferring}/>
                );
            } else {
                return (<div>Not connected to rclone.</div>);
            }

        } else if (mode === "modal") {
            if (transferring && transferring.length > 0)
                return (
                    <Card className={"progress-modal"}>
                        <CardHeader>Progress</CardHeader>
                        <CardBody>
                            <TransferringJobsRow transferring={transferring}/>

                        </CardBody>
                    </Card>
                );
            return null;
        }
    }
}

RunningJobs.propTypes = {
    mode: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
    jobs: PropTypes.object.isRequired,
    error: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {

    const speedData = state.status.speed;
    let lineChartData = {};
    if (speedData) {
        let labels = [];
        let data = [];

        const dataLength = speedData.length;
        //
        const limitedData = speedData.slice(dataLength - 100, dataLength - 1);
        // console.log(limitedData.length);
        limitedData.forEach((item, idx) => {
            labels.push(Math.ceil(item.elapsedTime));
            data.push(bytesToMB(item.speed).toFixed(2));
        });

        lineChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Average Speed (mbps)',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: data,
                },
            ],
        };
    }


    return {
        jobs: state.status.jobs,
        isConnected: state.status.isConnected,
        error: state.status.error,
        lineChartData
    }
};

export default connect(mapStateToProps, {})(RunningJobs);
