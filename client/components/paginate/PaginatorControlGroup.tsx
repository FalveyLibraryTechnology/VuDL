import React from "react";

interface PaginatorControlGroupProps {
    callback: (item: string) => void;
    children: Array<string>;
    label: string;
}

const PaginatorControlGroup = ({ callback, children, label }: PaginatorControlGroupProps): React.ReactElement => {
    return (
        <div className="group" id={label}>
            {children.map((item) => (
                <button onClick={() => callback(item)} key={item}>
                    {item}
                </button>
            ))}
        </div>
    );
};

export default PaginatorControlGroup;
