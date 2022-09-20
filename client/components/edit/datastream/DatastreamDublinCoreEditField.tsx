import React from "react";
import FormControl from "@mui/material/FormControl";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import NativeSelect from "@mui/material/NativeSelect";
import TextField from "@mui/material/TextField";

interface DatastreamDublinCoreEditFieldProps {
    value: string;
    setValue: (value: string) => void;
    fieldType: string;
    legalValues?: Array<string>;
}

const DatastreamDublinCoreEditField = ({
    value,
    setValue,
    fieldType,
    legalValues = [],
}: DatastreamDublinCoreEditFieldProps): React.ReactElement => {
    const eventHelperCallback = (e) => {
        setValue(e.target.value);
    };
    switch (fieldType) {
        case "dropdown":
            if (!legalValues.includes(value)) {
                legalValues.push(value);
            }
            return (
                <FormControl fullWidth={true}>
                    <NativeSelect value={value} onChange={eventHelperCallback}>
                        {legalValues.map((current, index) => {
                            return (
                                <option key={`${current}_${index}`} value={current}>
                                    {current}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </FormControl>
            );
        case "html":
            return (
                <textarea style={{ width: "100%" }} onBlur={eventHelperCallback}>
                    {value}
                </textarea>
            );
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
