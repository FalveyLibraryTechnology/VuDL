import React from "react";

interface ParentControlProps {
    parent: string;
    handleParentChange: React.ChangeEventHandler<HTMLInputElement>;
    noParent: boolean;
}

const ParentControl = ({ parent, handleParentChange, noParent }: ParentControlProps): React.ReactElement => {
    return (
        <label>
            Parent ID
            <input type="text" value={parent} name="parent" onChange={handleParentChange} required={!noParent} />
        </label>
    );
};

export default ParentControl;
