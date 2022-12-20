import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../../context/FetchContext";
import { apiUrl, newEditObjectUrl } from "../../../util/routes";
import Link from "next/link";
import ParentControl from "../../shared/ParentControl";
import NoParentControl from "../../shared/NoParentControl";
import StateControls from "../../shared/StateControls";
import CategoryTreeView from "./CategoryTreeView";

interface CreateObjectProps {
    parentPid: string;
    allowChangeParentPid: boolean;
    allowNoParentPid: boolean;
}

const CreateObject = ({
    parentPid = "",
    allowNoParentPid = false,
    allowChangeParentPid = true,
}: CreateObjectProps): React.ReactElement => {
    const {
        action: { fetchText, fetchJSON },
    } = useFetchContext();
    const [models, setModels] = useState({});
    const [selectedModel, setSelectedModel] = useState("");
    const [results, setResults] = useState({
        state: "initial",
        content: "",
    });
    const [title, setTitle] = useState("");
    const [currentState, setCurrentState] = useState("Inactive");
    const [noParent, setNoParent] = useState(allowNoParentPid && parentPid === "");
    const [parent, setParent] = useState(parentPid);
    const handleParentChange = (event) => {
        setParent(event.target.value);
        if (allowNoParentPid) {
            setNoParent(event.target.value.length === 0);
        }
    };

    const handleNoParentChange = (event) => {
        setNoParent(event.target.checked);
        if (allowChangeParentPid && event.target.checked) {
            setParent("");
        }
    };

    useEffect(() => {
        async function loadModels() {
            let models = {};
            try {
                models = await fetchJSON(apiUrl + "/edit/models");
            } catch (e) {
                const error = e as Error;
                console.error("Problem fetching models: ", error.message);
            }
            setModels(models);
        }
        loadModels();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setResults({
            state: "loading",
            content: "Working...",
        });
        try {
            const params = {
                method: "POST",
                body: JSON.stringify({
                    title,
                    parent,
                    model: selectedModel,
                    state: currentState,
                }),
            };
            const headers = { "Content-Type": "application/json" };
            const pid = await fetchText(newEditObjectUrl, params, headers);
            setResults({
                state: "success",
                content: pid,
            });
        } catch (e) {
            setResults({
                state: "error",
                content: "Error: " + e.message,
            });
        }
    };

    switch (results.state) {
        case "loading":
        case "error":
            return <>{results.content}</>;
        case "success":
            return (
                <span>
                    Object created: <Link href={"/edit/object/" + results.content}>{results.content}</Link>
                </span>
            );
        default:
            return (
                <form onSubmit={handleSubmit} className="editor__create-object">
                    <label>
                        Title
                        <input
                            type="text"
                            value={title}
                            name="title"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setTitle(event.target.value);
                            }}
                            required
                        />
                    </label>

                    {allowNoParentPid && allowChangeParentPid && (
                        <NoParentControl handleNoParentChange={handleNoParentChange} noParent={noParent} />
                    )}

                    {allowChangeParentPid && (
                        <ParentControl parent={parent} handleParentChange={handleParentChange} noParent={noParent} />
                    )}
                    <StateControls currentState={currentState} setCurrentState={setCurrentState} />

                    <label>
                        Select Model Type:
                        <b>{selectedModel}</b>
                    </label>
                    <CategoryTreeView models={models} setSelectedModel={setSelectedModel} />
                    {selectedModel && <button>Create Object</button>}
                </form>
            );
    }
};

export default CreateObject;
