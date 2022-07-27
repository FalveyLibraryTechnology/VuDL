import React, { useEffect } from "react";
import ChildList from "./children/ChildList";
import Breadcrumbs from "./Breadcrumbs";
import ObjectSummary from "./ObjectSummary";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import DatastreamList from "./datastream/DatastreamList";
import DatastreamModal from "./datastream/DatastreamModal";
import StateModal from "./StateModal";
import { useEditorContext } from "../../context/EditorContext";
import EditorSnackbar from "./EditorSnackbar";

interface ObjectEditorProps {
    pid: string;
}

const ObjectEditor = ({ pid }: ObjectEditorProps): React.ReactElement => {
    const {
        action: { initializeCatalog, loadCurrentObjectDetails, setCurrentPid },
    } = useEditorContext();

    useEffect(() => {
        setCurrentPid(pid);
        loadCurrentObjectDetails();
        initializeCatalog();
    }, []);

    return (
        <div>
            <Breadcrumbs pid={pid} />
            <h1>Editor: Object {pid}</h1>
            <ObjectSummary />
            <Grid container>
                <Grid item xs={4}>
                    <Box>
                        <h3>Object Tools</h3>
                        <ul>
                            <li>
                                <Link href={`/edit/object/${pid}/newChild`}>Create New Child Object</Link>
                            </li>
                        </ul>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box>
                        <h3>Datastreams</h3>
                        <DatastreamList />
                    </Box>
                </Grid>
            </Grid>

            <DatastreamModal />
            <StateModal />
            <h2>Contents</h2>
            <ChildList pid={pid} />
            <EditorSnackbar />
        </div>
    );
};

export default ObjectEditor;
