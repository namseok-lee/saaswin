export const treeData = (data = [], treeCol) => {
    const updatedArr = data.map((item) => {
        // const treeColData = item.hierarchy.split('$');
        const treeColData = item?.[treeCol]?.split('$');
        return {
            ...item,
            hierarchy: treeColData,
        };
    });
    return updatedArr;
};
