import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../context/FetchContext";
import { getObjectChildrenUrl } from "../../util/routes";
import Link from "next/link";

interface ChildListProps {
    pid: string;
}
interface Children {
    numFound: number;
    start: number;
    docs: Record<string, string>[];
}

const ChildList = ({ pid = "" }: ChildListProps): React.ReactElement => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [children, setChildren] = useState<Children>({
        numFound: 0,
        start: 0,
        docs: [],
    });

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = getObjectChildrenUrl(pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching tree data from " + url);
            }
            setChildren(data);
        }
        loadData();
    }, []);
    const contents = (children?.docs ?? []).map((child) => {
        return (
            <li key={(pid || "root") + "child" + child.id}>
                <Link href={"/edit/object/" + child.id}>{(child.title ?? "-") + " [" + child.id + "]"}</Link>
            </li>
        );
    });
    return <ul>{contents}</ul>;
};

export default ChildList;
