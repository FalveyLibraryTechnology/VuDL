import React, { useEffect } from "react";
import PropTypes from "prop-types";
import ChildList from "./ChildList";
import ObjectSummary from "./ObjectSummary";
import { Grid, Box } from "@mui/material";
import Link from "next/link";
import DatastreamList from "./datastream/DatastreamList";
import DatastreamModal from "./datastream/DatastreamModal";
import { useEditorContext } from "../../context/EditorContext";

const ObjectEditor = ({ pid }) => {
    const {
        action: { setCurrentPid, initializeModelsCatalog },
    } = useEditorContext();

    useEffect(() => {
        setCurrentPid(pid);
        initializeModelsCatalog();
    }, []);

    return (
        <div>
            <h1>Editor: Object {pid}</h1>
            <ObjectSummary pid={pid} />
            <h2>Tools</h2>
            <Grid container>
                <Grid item xs={4}>
                    <Box>
                        <h3>Object</h3>
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
            <h2>Contents</h2>
            <ChildList pid={pid} />
        </div>
    );
};

ObjectEditor.propTypes = {
    pid: PropTypes.string,
};

export default ObjectEditor;
