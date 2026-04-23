import React, { Dispatch } from "react";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";

interface CategoryTreeViewProps {
    models: Record<string, string>;
    setSelectedModel: Dispatch<string>;
}

const CategoryTreeView = ({ models, setSelectedModel }: CategoryTreeViewProps): React.ReactElement => {
    const handleItemSelectionToggle = (event: React.SyntheticEvent | null, itemId: string, isSelected: boolean) => {
        // Only process when item is selected (not deselected)
        if (!isSelected) {
            return;
        }
        // Ignore categories (those that start with __)
        if (itemId.startsWith("__")) {
            return;
        }
        setSelectedModel(itemId);
    };

    return (
        <SimpleTreeView onItemSelectionToggle={handleItemSelectionToggle}>
            {Object.entries(models).map(([category, categoryValue]) => {
                return (
                    <TreeItem itemId={`__${category}`} key={category} id={`__${category}`} label={category}>
                        {Object.entries(categoryValue).map(([model, value]) => {
                            return <TreeItem itemId={value} key={model} id={value} label={model} />;
                        })}
                    </TreeItem>
                );
            })}
        </SimpleTreeView>
    );
};

export default CategoryTreeView;
