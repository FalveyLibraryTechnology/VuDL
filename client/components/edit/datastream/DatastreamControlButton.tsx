import React, { useState } from "react";
import styles from "./Datastream.module.css";
import Button from "@mui/material/Button";
import DataObject from "@mui/icons-material/DataObject";
import Download from "@mui/icons-material/Download";
import Delete from "@mui/icons-material/Delete";
import Preview from "@mui/icons-material/Preview";
import UploadFile from "@mui/icons-material/UploadFile";
import { useEditorContext } from "../../../context/EditorContext";
import { useGlobalContext } from "../../../context/GlobalContext";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";

const Icons = {
    Upload: <UploadFile />,
    View: <Preview />,
    Metadata: <DataObject />,
    Download: <Download />,
    Delete: <Delete />,
};

interface DatastreamControlButtonProps {
    modalState: string;
    datastream: string;
    disabled: boolean;
}

const DatastreamControlButton = ({
    modalState,
    datastream,
    disabled,
}: DatastreamControlButtonProps): React.ReactElement => {
    const [isLoading, setLoading] = useState(false);
    const {
        action: { setActiveDatastream, setDatastreamModalState },
    } = useEditorContext();
    const {
        action: { openModal },
    } = useGlobalContext();
    const { downloadDatastream } = useDatastreamOperation();
    const onClick = (modalState) => {
        if (modalState !== "Download") {
            return () => {
                setActiveDatastream(datastream);
                setDatastreamModalState(modalState);
                openModal("datastream");
            };
        }
        return async () => {
            setLoading(true);
            await downloadDatastream(datastream);
            setLoading(false);
        };
    };
    return (
        <Button
            className={styles.datastreamControlButton}
            disabled={modalState !== "Upload" && disabled}
            onClick={onClick(modalState)}
            aria-label={modalState}
            title={modalState}
        >
            {Icons[modalState]}
        </Button>
    );
};

export default DatastreamControlButton;
