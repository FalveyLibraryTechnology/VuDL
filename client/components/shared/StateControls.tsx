import React, { Dispatch } from "react";

interface StateControlsProp {
    currentState: string;
    setCurrentState: Dispatch<string>;
}

const StateControls = ({ currentState, setCurrentState }: StateControlsProp): React.ReactElement => {
    const handleStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentState(event.target.value);
    };
    const states = ["Active", "Inactive", "Deleted"];
    return (
        <>
            {states.map((state) => (
                <label key={state + "-label"}>
                    {state}
                    <input
                        type="radio"
                        name="state"
                        value={state}
                        checked={currentState === state}
                        onChange={handleStateChange}
                    />
                </label>
            ))}
        </>
    );
};

export default StateControls;
