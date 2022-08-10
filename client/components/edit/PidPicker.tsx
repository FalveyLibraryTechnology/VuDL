import React, { useState } from "react";

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
                PID: <input type="text" value={textboxPid} onChange={(e) => setTextboxPid(e.target.value)} />
            </label>
            <button onClick={() => setSelected(textboxPid)}>Set</button>
        </>
    );
};

export default PidPicker;
