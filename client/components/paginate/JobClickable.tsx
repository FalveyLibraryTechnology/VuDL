import React from "react";
import Link from "next/link";

interface JobClickableProps {
    category: string;
    children: string;
    clickable: boolean;
    clickWarning: string;
}

const JobClickable = ({ category, children, clickable, clickWarning }: JobClickableProps): React.ReactElement => {
    const handleClick = (e: React.MouseEvent) => {
        if (clickWarning && !window.confirm(clickWarning)) {
            e.preventDefault();
        }
    };
    return clickable ? (
        <Link href={`/paginate/${category}/${children}`} onClick={handleClick}>
            {children}
        </Link>
    ) : (
        <span>{children}</span>
    );
};

export default JobClickable;
