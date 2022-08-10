import React, { useState } from "react";
import ChildList from "./children/ChildList";

interface PidPickerProps {
    selected: string;
    setSelected: (string) => void;
}

const PidPicker = ({ selected, setSelected }: PidPickerProps): React.ReactElement => {
    const [textboxPid, setTextboxPid] = useState<string>("");
    return selected.length > 0 ? (
        <>
            Selected pid: {selected}. <button onClick={() => setSelected("")}>Clear</button>
        </>
    ) : (
        <>
            <label>
                Enter PID: <input type="text" value={textboxPid} onChange={(e) => setTextboxPid(e.target.value)} />
            </label>
            <button onClick={() => setSelected(textboxPid)}>Set</button>
            <label>Choose PID from Tree:</label>
            <ChildList selectCallback={setSelected} />
        </>
    );
};

export default PidPicker;
