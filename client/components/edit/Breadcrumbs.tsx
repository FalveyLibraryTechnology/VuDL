import styles from "./Breadcrumbs.module.css";
import React, { useEffect } from "react";
import { TreeData, generateBreadcrumbTrails, processBreadcrumbData } from "../../util/Breadcrumbs";
import { useEditorContext } from "../../context/EditorContext";
import Link from "next/link";

interface BreadcrumbsProps {
    pid: string;
}

const Breadcrumbs = ({ pid = "" }: BreadcrumbsProps): React.ReactElement => {
    const {
        state: { parentDetailsStorage },
        action: { loadParentDetailsIntoStorage },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(parentDetailsStorage, pid);

    useEffect(() => {
        if (!loaded) {
            loadParentDetailsIntoStorage(pid);
        }
    }, [loaded]);

    const treeData: TreeData = loaded
        ? processBreadcrumbData(parentDetailsStorage[pid])
        : {
              topNodes: [],
              childLookups: {},
              records: {},
          };

    const allTrails = generateBreadcrumbTrails(treeData, pid);
    const contents = allTrails.map((trail, trailIndex: number) => {
        const breadcrumbs = trail.map((breadcrumb) => {
            return (
                <li key={"breadcrumb_" + breadcrumb.pid + "_" + trailIndex}>
                    <Link href={"/edit/object/" + breadcrumb.pid}>{breadcrumb.title}</Link>
                </li>
            );
        });
        breadcrumbs.unshift(
            <li key={"breadcrumb_home_" + trailIndex}>
                <Link href="/edit">Edit Home</Link>
            </li>
        );
        return (
            <ul className={styles.breadcrumb} key={"breadcrumbs" + "_" + trailIndex}>
                {breadcrumbs}
            </ul>
        );
    });
    return <>{contents}</>;
};

export default Breadcrumbs;
