import React, { useEffect, useState } from "react";
import { baseUrl, objectDatastreamLicenseUrl } from "../../util/routes";
import { getObjectDetailsUrl, objectDatastreamDublinCoreUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";
import { useEditorContext } from "../../context/EditorContext";
import BasicBreadcrumbs from "../shared/BasicBreadcrumbs";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import BlurSavingTextField from "../shared/BlurSavingTextField";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import PidPicker from "../edit/PidPicker";

const BulkEditor = (): React.ReactElement => {
    const {
        state: { licensesCatalog, dublinCoreFieldCatalog },
        action: { initializeCatalog },
    } = useEditorContext();
    const [operation, setOperation] = useState("none");
    const [results, setResults] = useState("");
    const [selectedRecords, setSelectedRecords] = useState("");
    const [licenseKey, setLicenseKey] = useState("");
    const [topPid, setTopPid] = useState("");
    const [query, setQuery] = useState("");
    const [limit, setLimit] = useState("50");
    const [selectedRecordIds, setSelectedRecordIds] = useState<Array<string>>([]);
    const [findString, setFindString] = useState("");
    const [replaceString, setReplaceString] = useState("");
    const [replaceField, setReplaceField] = useState("");
    const [dcField, setDcField] = useState("dc:title");
    const {
        action: { fetchJSON, fetchText },
    } = useFetchContext();

    useEffect(() => {
        initializeCatalog();
    }, []);

    const doFetchRecords = async () => {
        try {
            const queryParts = [];
            if (query.trim().length > 0) {
                queryParts.push(`(${query.trim()})`);
            }
            const trimmedTopPid = topPid.trim();
            if (trimmedTopPid.length > 0) {
                queryParts.push(`(id:"${trimmedTopPid}" OR hierarchy_all_parents_str_mv:"${trimmedTopPid}")`);
            }
            const combinedQuery = queryParts.join(" AND ");
            const result = await fetchText(
                baseUrl + "/api/edit/query/solr",
                { method: "POST", body: JSON.stringify({ query: combinedQuery, rows: parseInt(limit) }) },
                { "Content-Type": "application/json" },
            );
            const json = JSON.parse(result);
            let text = "";
            const newSelectedRecordIds: Array<string> = [];
            if (json.numFound < 1) {
                text = "No results found.";
            } else {
                json.docs.forEach((doc) => {
                    text += `${doc.id}:\t${doc.title}\n`;
                    newSelectedRecordIds.push(doc.id);
                });
            }
            setSelectedRecords(text);
            setSelectedRecordIds(newSelectedRecordIds);
        } catch (error) {
            setSelectedRecords(error.message);
        }
        setResults("");
    };

    const doApplyChanges = async () => {
        try {
            if (licenseKey == "") {
                setResults("No change requested.");
                return;
            }
            if (selectedRecordIds.length < 1) {
                setResults("No records selected.");
                return;
            }
            let result = "";
            for (let i = 0; i < selectedRecordIds.length; i++) {
                const id = selectedRecordIds[i];
                const text = await fetchText(
                    objectDatastreamLicenseUrl(id, "LICENSE"),
                    {
                        method: "POST",
                        body: JSON.stringify({
                            licenseKey,
                        }),
                    },
                    { "Content-Type": "application/json" },
                );
                result += `(${i + 1}/${selectedRecordIds.length}) ${id}: ${text}\n`;
                setResults(result);
            }
        } catch (error) {
            setResults(error.message);
        }
    };
    interface FieldReplacement {
        id: string;
        metadata: Record<string, Array<string>>;
        oldValues: Array<string>;
        newValues: Array<string>;
    }
    const getFieldReplacements = async (): Promise<Array<FieldReplacement>> => {
        const replacements: Array<FieldReplacement> = [];
        for (const id of selectedRecordIds) {
            const details = await fetchJSON(getObjectDetailsUrl(id));
            const metadata = details.metadata ?? {};
            const oldValues = metadata[dcField] ?? [];
            if (replaceField != "") {
                const newValues = [replaceField];
                replacements.push({ id, metadata, oldValues, newValues });
            } else {
                if (oldValues.some((value) => value.includes(findString))) {
                    const newValues = oldValues.map((value) => value.replaceAll(findString, replaceString));
                    replacements.push({ id, metadata, oldValues, newValues });
                }
            }
        }
        return replacements;
    };
    const isReplacementFormValid = (replacements: Array<FieldReplacement>) => {
        if (findString == "") {
            setResults("No search string provided.");
            return false;
        }
        if (replaceString == "" && replaceField == "") {
            setResults("No replacement string provided.");
            return false;
        }
        if (selectedRecordIds.length < 1) {
            setResults("No records selected.");
            return false;
        }
        if (replacements.length < 1) {
            setResults(`No matches for "${findString}" in ${dcField}.`);
            return false;
        }
        return true;
    };
    const isFieldReplacementFormValid = (replacements: Array<FieldReplacement>) => {
        if (replaceString == "" && replaceField == "") {
            setResults("No replacement string provided.");
            return false;
        }
        if (selectedRecordIds.length < 1) {
            setResults("No records selected.");
            return false;
        }
        if (replacements.length < 1) {
            setResults(`No matches for "${findString}" in ${dcField}.`);
            return false;
        }
        return true;
    };
    const doPreviewFieldText = async () => {
        try {
            const replacements = await getFieldReplacements();
            if (!(await isReplacementFormValid(replacements))) {
                return;
            }
            setResults(
                replacements
                    .map(
                        ({ id, oldValues, newValues }) =>
                            `${id}:\n  Old: ${oldValues.join(" | ")}\n  New: ${newValues.join(" | ")}\n`,
                    )
                    .join(""),
            );
        } catch (error) {
            setResults(error.message);
        }
    };
    const doPreviewReplaceField = async () => {
        try {
            const replacements = await getFieldReplacements();
            if (!(await isFieldReplacementFormValid(replacements))) {
                return;
            }
            setResults(
                replacements
                    .map(
                        ({ id, oldValues, newValues }) =>
                            `${id}:\n  Old: ${oldValues.join(" | ")}\n  New: ${newValues.join(" | ")}\n`,
                    )
                    .join(""),
            );
        } catch (error) {
            setResults(error.message);
        }
    };
    const doReplaceFieldText = async () => {
        try {
            const replacements = await getFieldReplacements();
            if (!(await isFieldReplacementFormValid(replacements))) {
                return;
            }
            let result = "";
            for (let i = 0; i < replacements.length; i++) {
                const { id, metadata, newValues } = replacements[i];
                metadata[dcField] = newValues;
                const text = await fetchText(
                    objectDatastreamDublinCoreUrl(id, "DC"),
                    { method: "POST", body: JSON.stringify({ metadata }) },
                    { "Content-Type": "application/json" },
                );
                result += `(${i + 1}/${replacements.length}) ${id}: ${text}\n`;
                setResults(result);
            }
        } catch (error) {
            setResults(error.message);
        }
    };

    let operationControls = selectedRecordIds.length < 1 ? "" :
        <>
            <h2>Choose Operation</h2>
            <FormControl>
                <FormLabel id="choose-operation-label"></FormLabel>
                <RadioGroup
                    aria-labelledby="choose-operation-label"
                    name="choose-operation"
                    value={operation}
                    onChange={(event) => {
                        setOperation(event.target.value);
                        setResults("");
                        setFindString("");
                        setReplaceString("");
                        setReplaceField("");
                        setLicenseKey("");
                    }}
                >
                    <FormControlLabel value="license" control={<Radio />} label="Change License" />
                    <FormControlLabel value="dcFields" control={<Radio />} label="Change DC Fields" />
                    <FormControlLabel value="replaceDcFields" control={<Radio />} label="Replace DC Fields" />
                </RadioGroup>
            </FormControl>

            {operation === "license" && (
                <>
                    <h3>Replace License</h3>
                    <FormControl fullWidth>
                        <InputLabel id="choose-new-license-label">Choose New License</InputLabel>
                        <Select
                            labelId="choose-new-license-label"
                            label="Choose New License"
                            value={licenseKey}
                            onChange={(event) => setLicenseKey(event.target.value)}
                        >
                            <MenuItem key="nochange" value="">
                                Do not change license.
                            </MenuItem>
                            {Object.entries(licensesCatalog).map(([key, license]) => {
                                return (
                                    <MenuItem key={key} value={key}>
                                        {license.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <button id="bulkEditSubmit" onClick={() => doApplyChanges()}>
                            Apply Changes
                        </button>
                    </FormControl>
                </>
            )}

            {operation === "dcFields" && (
                <>
                    <h2>Replace Text in DC Field</h2>
                    <FormControl fullWidth>
                        <InputLabel id="dc-field-label">Field</InputLabel>
                        <Select
                            labelId="dc-field-label"
                            label="Field"
                            value={dcField}
                            onChange={(event) => setDcField(event.target.value)}
                        >
                            {Object.entries(dublinCoreFieldCatalog)
                                .filter(([, field]) => field.type !== "locked")
                                .map(([key, field]) => (
                                    <MenuItem key={key} value={key}>
                                        {field.label}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <BlurSavingTextField
                            value={findString}
                            setValue={setFindString}
                            options={{ id: "find", label: "Find", variant: "outlined" }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <BlurSavingTextField
                            value={replaceString}
                            setValue={setReplaceString}
                            options={{ id: "replace-with", label: "Replace With", variant: "outlined" }}
                        />
                    </FormControl>
                    <FormControl>
                        <button onClick={() => doPreviewFieldText()}>Preview Changes</button>
                    </FormControl>
                    <FormControl>
                        <button onClick={() => doReplaceFieldText()}>Replace in Field</button>
                    </FormControl>
                </>
            )}
            {operation === "replaceDcFields" && (
                <>
                    <h2>Replace DC Field</h2>
                    <FormControl fullWidth>
                        <InputLabel id="dc-field-label">Field</InputLabel>
                        <Select
                            labelId="dc-field-label"
                            label="Field"
                            value={dcField}
                            onChange={(event) => setDcField(event.target.value)}
                        >
                            {Object.entries(dublinCoreFieldCatalog)
                                .filter(([, field]) => field.type !== "locked")
                                .map(([key, field]) => (
                                    <MenuItem key={key} value={key}>
                                        {field.label}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <BlurSavingTextField
                            value={replaceField}
                            setValue={setReplaceField}
                            options={{ id: "replace-whole-field-with", label: "New Field text", variant: "outlined" }}
                        />
                    </FormControl>
                    <FormControl>
                        <button onClick={() => doPreviewReplaceField()}>Preview Changes</button>
                    </FormControl>
                    <FormControl>
                        <button onClick={() => doReplaceFieldText()}>Replace Field</button>
                    </FormControl>
                </>
            )}
            <h2>Results:</h2>
            <pre title="Bulk Edit Results" id="bulkEditResults">
                {results}
            </pre>
        </>;

    return (
        <div>
            <BasicBreadcrumbs />
            <h1>Bulk Editor</h1>
            <h2>Record Selector</h2>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={query}
                    setValue={setQuery}
                    options={{ id: "search-query", label: "Search Query", variant: "outlined" }}
                />
            </FormControl>
            <label>Limit to children of this PID (optional):</label>
            <FormControl fullWidth>
                <PidPicker selected={topPid} setSelected={setTopPid} />
            </FormControl>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={limit}
                    setValue={setLimit}
                    options={{ id: "result-limit", label: "Result Limit", variant: "outlined" }}
                />
            </FormControl>
            <FormControl>
                <button onClick={() => doFetchRecords()}>Fetch Records</button>
            </FormControl>
            <p>{`${selectedRecordIds.length} selected.`}</p>
            <pre title="Selected Records" id="selectedRecords">
                {selectedRecords}
            </pre>
            {operationControls}
        </div>
    );
};

export default BulkEditor;
