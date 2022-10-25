import React, {useEffect, useRef} from "react";



import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";

export default class Plot extends React.Component {


    constructor(props) {
        super(props);
        


    }

    componentDidMount() {
        console.log("mount");
    }

    componentDidUpdate() {
        console.log("didUpdate");
    }

    render() {
        console.log('update', this.props.data.length);
        return (
        <div>{this.props.data.length}</div>
        );
    }
}

/*
export default function Plot({data}) {
    console.log('render');
    useEffect(() => {
        console.log("update");
    }, [data]);

    return (
        <div>{data.length}</div>
    );
}
*/