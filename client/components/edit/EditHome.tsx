import React from "react";
import ChildList from "./ChildList";
import Link from "next/link";

const EditHome = () => {
    return (
        <div>
            <h1>Editor</h1>
            <h2>Tools</h2>
            <ul>
                <li>
                    <Link href="/edit/newChild">Create New Top-Level Object</Link>
                </li>
            </ul>
            <h2>Contents</h2>
            <ChildList />
        </div>
    );
};

export default EditHome;
