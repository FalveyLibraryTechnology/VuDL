import React from "react";

interface NoParentControlProps {
    handleNoParentChange: React.ChangeEventHandler<HTMLInputElement>;
    noParent: boolean;
}

const NoParentControl = ({ handleNoParentChange, noParent }: NoParentControlProps): React.ReactElement => {
    return (
        <label>
            <input type="checkbox" name="noParent" value="1" onChange={handleNoParentChange} checked={noParent} />
            No parent PID
        </label>
    );
};

export default NoParentControl;
