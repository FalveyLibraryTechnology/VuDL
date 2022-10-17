import React, { useState } from "react";
import TextField from "@mui/material/TextField";

export interface BlurSavingTextFieldProps {
    value: string;
    setValue: (value: string) => void;
}

const BlurSavingTextField = ({ value, setValue }: BlurSavingTextFieldProps): React.ReactElement => {
    const [temporaryValue, setTemporaryValue] = useState(value);
    const handleBlurEvent = (event: React.ChangeEvent) => {
        setValue(event.target.value);
    };
    const handleChangeEvent = (event: React.ChangeEvent) => {
        setTemporaryValue(event.target.value);
    };
    return <TextField value={temporaryValue} onChange={handleChangeEvent} onBlur={handleBlurEvent} />;
};

export default BlurSavingTextField;
