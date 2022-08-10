import React, { useState } from "react";

const PidPicker = (): React.ReactElement => {
    const [selectedPid, setSelectedPid] = useState<string>("");
    const [textboxPid, setTextboxPid] = useState<string>("");
    return selectedPid.length > 0 ? (
        <>
            Selected pid: {selectedPid}. <button onClick={() => setSelectedPid("")}>Clear</button>
        </>
    ) : (
        <>
            PID: <input type="text" value={textboxPid} onChange={(e) => setTextboxPid(e.target.value)} />
            <button onClick={() => setSelectedPid(textboxPid)}>Set</button>
        </>
    );
};

export default PidPicker;
