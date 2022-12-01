import Breadcrumbs from "./Breadcrumbs";
import React, { useEffect } from "react";
import ChildList from "./children/ChildList";
import ParentsModal from "./parents/ParentsModal";
import StateModal from "./StateModal";
import EditorSnackbar from "./EditorSnackbar";
import Link from "next/link";
import { useEditorContext } from "../../context/EditorContext";

const EditHome = (): React.ReactElement => {
    const {
        action: { initializeCatalog },
    } = useEditorContext();

    useEffect(() => {
        initializeCatalog();
    }, []);
    return (
        <div>
            <Breadcrumbs />
            <h1>Editor</h1>
            <h2>Tools</h2>
            <ul>
                <li>
                    <Link href="/edit/newChild">Create New Top-Level Object</Link>
                </li>
            </ul>
            <h2>Contents</h2>
            <ParentsModal />
            <StateModal />
            <ChildList pid="" />
            <EditorSnackbar />
        </div>
    );
};

export default EditHome;
