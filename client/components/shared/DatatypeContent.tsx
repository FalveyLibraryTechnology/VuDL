import Box from "@mui/material/Box";
import React from "react";
import styles from "./DatatypeContent.module.css";

interface DatatypeContentProps {
    data: string;
    mimeType: string;
}

const DatatypeContent = ({ data, mimeType }: DatatypeContentProps): React.ReactElement => {
    switch (true) {
        case /image\/[-+.\w]+/.test(mimeType):
            return <img className={styles.viewContentImage} src={data} alt="Datastream Image" />;
        case /text\/[-+.\w]+/.test(mimeType):
            return <Box className={styles.viewContentText}>{data}</Box>;
        case /audio\/[-+.\w]+/.test(mimeType):
            return (
                <Box className={styles.viewContentAudio}>
                    <audio controls autoPlay preload="auto">
                        <source src={data} type={mimeType} />
                    </audio>
                </Box>
            );
        case /application\/pdf/.test(mimeType):
        default:
            return <object className={styles.viewContentObject} data={data} type={mimeType} />;
    }
};

export default DatatypeContent;
