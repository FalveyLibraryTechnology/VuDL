import { useFetchContext } from "../context/FetchContext";
import { useRef, useState } from "react";
import { getDerivUrl, getIngestUrl, getStatusUrl } from "../util/routes";
import { getAgeString } from "../util/useJobHelper";

const useJob = ({ category, children }) => {
    const {
        action: { makeRequest, fetchJSON },
    } = useFetchContext();
    const [statusText, setStatusText] = useState([]);
    const [published, setPublished] = useState();
    const [clickWarning, setClickWarning] = useState("");
    const [action, setAction] = useState(null);
    const [ingestInfo, setIngestInfo] = useState("");
    const [clickable, setClickable] = useState(false);
    const timeoutRef = useRef();
    const derivativeTypeCount = 3;

    const getPublishedStatusText = ({ derivatives, ingesting, published }) => {
        if (published) {
            if (ingesting) {
                return ["ingesting now; cannot be edited"];
            }
            setAction({
                onClick: ingest,
                text: "ingest now",
            });
            return ["queued for ingestion; cannot be edited"];
        } else if (derivatives.expected === derivatives.processed) {
            setClickable(true);
            return ["ready"];
        }
        if (!derivatives.building) {
            setAction({
                onClick: buildDerivatives,
                text: "build derivatives",
            });
        }
        const percentDone = 100 * (derivatives.processed / derivatives.expected);
        setClickable(true);
        return ["derivatives: " + percentDone.toFixed(2) + "% built"];
    };

    const getJobStatusText = ({ derivatives, documents, audio, ingesting, published }) => {
        if (derivatives.expected === 0 && documents === 0 && audio === 0) {
            return ["empty job"];
        }
        const pageCount = parseInt(derivatives.expected / derivativeTypeCount);
        return [
            ...(documents > 0 ? [`${documents} document${documents > 1 ? "s" : ""}`] : []),
            ...(audio > 0 ? [`${audio} audio`] : []),
            `${pageCount} page${pageCount > 1 ? "s" : ""}`,
            ...getPublishedStatusText({ derivatives, ingesting, published }),
        ];
    };
    const getStatusText = ({ derivatives, minutes_since_upload, documents, audio, ingesting, published }) => {
        if (typeof derivatives !== "undefined") {
            if (minutes_since_upload < 10) {
                setClickWarning(
                    `This job was updated ${minutes_since_upload} minute` +
                        `${minutes_since_upload !== 1 ? "s" : ""} ago. Please do not edit it` +
                        " unless you are sure all uploads have fully completed."
                );
            }
            return [
                getAgeString(minutes_since_upload),
                ...getJobStatusText({ derivatives, documents, audio, ingesting, published }),
            ];
        }
        return ["loading..."];
    };

    const buildDerivatives = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await makeRequest(
            getDerivUrl(category, children),
            {
                method: "PUT",
            },
            {
                "Content-Type": "application/json",
            }
        );
        setClickable(false);
        setClickWarning("");
        setAction(null);
        await updateStatus();
    };

    const ingest = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure? This will put a load on the server!")) {
            return;
        }
        await makeRequest(
            getIngestUrl(category, children),
            {
                method: "PUT",
            },
            {
                "Content-Type": "application/json",
            }
        );
        setClickable(false);
        setClickWarning("");
        setAction(null);
        await updateStatus();
    };

    const updateStatus = async (e) => {
        if (typeof e !== "undefined") {
            e.stopPropagation();
        }
        try {
            const response = await fetchJSON(getStatusUrl(category, children));
            setIngestInfo(response?.ingest_info);
            setPublished(response?.published);
            setStatusText(getStatusText(response));
            if (
                response?.derivatives?.building ||
                (typeof response.ingest_info !== "undefined" && response?.ingest_info.length > 0)
            ) {
                timeoutRef.current = setTimeout(updateStatus, 1000);
            }
        } catch (error) {
            setIngestInfo([]);
            setPublished(false);
            console.error(error);
        }
    };

    return {
        state: {
            action,
            clickable,
            clickWarning,
            ingestInfo,
            statusText,
            timeoutRef,
            published,
        },
        action: {
            updateStatus,
        },
    };
};

export default useJob;
