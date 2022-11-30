import styles from "./Breadcrumbs.module.css";
import React from "react";
import Link from "next/link";

const BasicBreadcrumbs = (): React.ReactElement => {
    return (
        <ul className={styles.breadcrumb}>
            <li>
                <Link href="/">Main Menu</Link>
            </li>
        </ul>
    );
};

export default BasicBreadcrumbs;
