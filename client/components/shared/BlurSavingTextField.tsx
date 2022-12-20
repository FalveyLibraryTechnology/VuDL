import React, { useState } from "react";
import TextField from "@mui/material/TextField";

export interface BlurSavingTextFieldProps {
    value: string;
    setValue: (value: string) => void;
    options?: Record<string, unknown>;
}

const BlurSavingTextField = ({ value, setValue, options = {} }: BlurSavingTextFieldProps): React.ReactElement => {
    const [temporaryValue, setTemporaryValue] = useState(value);
    const handleBlurEvent = (event: React.ChangeEvent) => {
        if (event.target.value !== value) {
            setValue(event.target.value);
        }
    };
    const handleChangeEvent = (event: React.ChangeEvent) => {
        setTemporaryValue(event.target.value);
    };
    return <TextField value={temporaryValue} onChange={handleChangeEvent} onBlur={handleBlurEvent} {...options} />;
};

export default BlurSavingTextField;
