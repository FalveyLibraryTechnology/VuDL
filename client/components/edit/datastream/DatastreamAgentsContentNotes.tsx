import React, { useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import Collapse from "@mui/material/Collapse";
import Delete from "@mui/icons-material/Delete";
import Send from "@mui/icons-material/Send";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

interface DatastreamAgentsContentNotesProps {
    expanded: boolean;
    notes: Array<string>;
    setNotes: (notes: Array<string>) => void;
}
const DatastreamAgentsContentNotes = ({
    expanded,
    notes,
    setNotes,
}: DatastreamAgentsContentNotesProps): React.ReactElement => {
    const [note, setNote] = useState("");
    const onEditNote = (value: string, noteIndex: number) => {
        notes[noteIndex] = value;
        setNotes(notes);
    };
    const addNote = () => {
        notes.push(note);
        setNotes(notes);
        setNote("");
    };
    const deleteNote = (noteIndex: number) => {
        notes.splice(noteIndex, 1);
        setNotes(notes);
    };
    return (
        <Grid container item xs={12}>
            <FormControl fullWidth={true}>
                <Collapse in={expanded}>
                    <Grid container item xs={12}>
                        <FormControl fullWidth={true}>
                            <Grid container spacing={1}>
                                {notes.map((note, i) => {
                                    return (
                                        <Grid key={i} container item xs={12}>
                                            <TextField
                                                className="noteModifyTextField"
                                                label="Note"
                                                fullWidth={true}
                                                value={note}
                                                onChange={(event) => onEditNote(event.target.value, i)}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                className="deleteNoteButton"
                                                                onClick={() => deleteNote(i)}
                                                                edge="end"
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    );
                                })}
                                <Grid container item xs={12}>
                                    <TextField
                                        className="noteAddTextField"
                                        required={true}
                                        placeholder="Add Notes"
                                        fullWidth
                                        value={note}
                                        onChange={(event) => {
                                            setNote(event.target.value);
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton className="addNoteButton" onClick={addNote} edge="end">
                                                        <Send />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Grid>
                </Collapse>
            </FormControl>
        </Grid>
    );
};

export default DatastreamAgentsContentNotes;
