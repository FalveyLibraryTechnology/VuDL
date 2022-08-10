import React, { useState } from "react";
import ChildList from "./children/ChildList";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Enter PID manually</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        <label>
                            Enter PID:{" "}
                            <input type="text" value={textboxPid} onChange={(e) => setTextboxPid(e.target.value)} />
                        </label>
                        <button onClick={() => setSelected(textboxPid)}>Set</button>
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Choose PID from Tree</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        <ChildList selectCallback={setSelected} />
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default PidPicker;
