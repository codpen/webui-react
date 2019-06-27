import React from "react";
import {shallow} from "enzyme";
import {testStore} from "../../../../Utils";
import BandwidthStatusCard from "./BandwidthStatusCard";
import toJson from "enzyme-to-json";

const setUp = (intialState = {}, props = {}) => {
    const store = testStore(intialState);
    const component = shallow(<BandwidthStatusCard {...props} store={store}/>);
    return component.childAt(0).dive();
};


describe('Bandwidth Status Card', function () {

    let wrapper;
    beforeEach(() => {
        const initialState = {
            status: {
                checkStatus: true,
                bandwidth: {
                    rate: '1M'
                }
            }
        };

        const props = {};
        wrapper = setUp(initialState, props)
    });

    it('should render without crashing', function () {
        expect(wrapper).toHaveLength(1)
    });
    it('should match snapshot', function () {
        expect(toJson(wrapper)).toMatchSnapshot()
    });
});