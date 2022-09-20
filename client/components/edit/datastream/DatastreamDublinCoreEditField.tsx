import React from "react";
import FormControl from "@mui/material/FormControl";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import TextField from "@mui/material/TextField";

interface DatastreamDublinCoreEditFieldProps {
    value: string;
    setValue: (value: string) => void;
    fieldType: string;
}

const DatastreamDublinCoreEditField = ({
    value,
    setValue,
    fieldType,
}: DatastreamDublinCoreEditFieldProps): React.ReactElement => {
    switch (fieldType) {
        case "html":
            const textareaCallback = (e) => {
                setValue(e.target.value);
            };
            return <textarea style={{ width: "100%" }} onBlur={textareaCallback}>{value}</textarea>;
        case "locked":
            return (
                <FormControl fullWidth={true}>
                    <TextField type="text" value={value} disabled={true} />
                </FormControl>
            );
        case "text":
            return (
                <FormControl fullWidth={true}>
                    <BlurSavingTextField value={value} setValue={setValue} />
                </FormControl>
            );
        default:
            return <p>{`Unsupported type (${fieldType}): ${value}`}</p>;
    }
};

export default DatastreamDublinCoreEditField;
