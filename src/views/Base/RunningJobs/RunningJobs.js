import React from 'react';
import {Button, Card, CardBody, CardHeader, Col, Progress, Row} from "reactstrap";
import {bytesToKB, formatBytes, secondsToStr} from "../../../utils/Tools";
import * as PropTypes from "prop-types";
import {connect} from "react-redux";
import {Line} from "react-chartjs-2";
import {CustomTooltips} from "@coreui/coreui-plugin-chartjs-custom-tooltips";

const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }],
        xAxes: [{
            ticks: {
                display: false
            }
        }]
    }
};
function JobCard({job}) {
    const {name, eta, percentage, speed, speedAvg, size, bytes} = job;
    if (name && !isNaN(speed)) {

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
    return null;
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

    constructor(props, context) {
        super(props, context);
        this.state = {
            isShowing: true
        }
    }

    toggleShowing = () => {
        this.setState((prevState) => {
            return {
                isShowing: !prevState.isShowing
            }
        })
    };



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
                            <Card>
                                <CardHeader>
                                    Speed
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-wrapper">
                                        <Line data={lineChartData} options={options}/>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col sm={12} lg={4}>
                            <TransferringJobs transferring={transferring}/>
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
                    <Card className="progress-modal d-none d-sm-block">
                        <CardHeader onClick={() => this.toggleShowing()}>Progress
                            <div className="card-header-actions">
                                <Button color="link">
                                    <i className="fa fa-close fa-lg"/>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className={!this.state.isShowing ? "d-none" : ""}>
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
        let data1 = [];
        let data2 = [];

        const dataLength = speedData.length;
        //
        const limitedData = speedData.slice(dataLength - 50, dataLength - 1);
        // console.log(limitedData.length);
        limitedData.forEach((item, idx) => {
            labels.push(Math.ceil(item.elapsedTime));
            data1.push(bytesToKB(item.speed).toFixed(2));
            data2.push(bytesToKB(item.speedAvg).toFixed(2));
        });

        // console.log(data1, data2);
        lineChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Speed (kbps)',
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
                    data: data1,
                },
                {
                    label: 'Average Speed (kbps)',
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(187,69,14,0.4)',
                    borderColor: 'rgb(192,76,58)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgb(187,69,14)',
                    pointBackgroundColor: '#ff7459',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: data2,
                }
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
