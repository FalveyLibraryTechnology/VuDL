import React from "react";
import Box from "@mui/material/Box";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import Link from "next/link";

interface GenericErrorProps {
    message: string;
}

const GenericError = ({ message }: GenericErrorProps): React.ReactElement => {
    return (
        <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center" minHeight="100vh">
            <SentimentVeryDissatisfiedIcon sx={{ fontSize: "100px", color: "red" }} />
            <br />
            <Box width="300px">
                <Box sx={{ fontSize: "24px", padding: "4px" }}>
                    A generic error occurred. Please return <Link href="/">home.</Link>
                </Box>
                <Box sx={{ fontSize: "16px", padding: "4px" }}>Error details: {message}</Box>
            </Box>
        </Box>
    );
};

export default GenericError;
