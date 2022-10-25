import { isLabelWithInternallyDisabledControl } from "@testing-library/user-event/dist/utils";

const style = {
    zIndex: 10, 
    position: 'absolute', 
    top: '0px', 
    right: '0px',
    backgroundColor: 'white',
    margin: '5px'
};

export default function HoverBox() {
    return (
        <div style={style}>Kokos</div>
    );
}