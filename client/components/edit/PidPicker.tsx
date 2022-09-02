import React, { useState } from "react";
import ChildList from "./children/ChildList";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEditorContext } from "../../context/EditorContext";

interface PidPickerProps {
    selected: string;
    setSelected: (pid: string) => void;
}

const PidPicker = ({ selected, setSelected }: PidPickerProps): React.ReactElement => {
    const {
        state: { favoritePidsCatalog },
    } = useEditorContext();
    const [textboxPid, setTextboxPid] = useState<string>("");
    const favorites = [];
    for (const pid in favoritePidsCatalog) {
        favorites[favorites.length] = (
            <li key={`favorite_${pid}`}>
                <button onClick={() => setSelected(pid)}>{favoritePidsCatalog[pid]}</button>
            </li>
        );
    }
    const favoritesAccordion =
        favorites.length > 0 ? (
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Choose PID from Favorites</AccordionSummary>
                <AccordionDetails>
                    <ul>{favorites}</ul>
                </AccordionDetails>
            </Accordion>
        ) : null;

    return selected.length > 0 ? (
        <>
            Selected pid: {selected}. <button onClick={() => setSelected("")}>Clear</button>
        </>
    ) : (
        <>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Enter PID manually</AccordionSummary>
                <AccordionDetails>
                    <label>
                        Enter PID:{" "}
                        <input type="text" value={textboxPid} onChange={(e) => setTextboxPid(e.target.value)} />
                    </label>
                    <button onClick={() => setSelected(textboxPid)}>Set</button>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Choose PID from Tree</AccordionSummary>
                <AccordionDetails>
                    <ChildList selectCallback={setSelected} />
                </AccordionDetails>
            </Accordion>
            {favoritesAccordion}
        </>
    );
};

export default PidPicker;
