export const treeData = (data = []) => {
    const ColData = [];
    const sortBySeqData = data.slice().sort((a, b) => a.level - b.level); // level 기준으로 정렬
    const removeIndex = [];

    sortBySeqData.map((item, index) => {
        const ognz_no = item.ognz_no; // 본인key
        const parent_no = item.parent_no; // 부모key
        //const custom_text = item.custom_text;

        item.Items = [];

        data.map((dataItem, dataIndex) => {
            if (ognz_no === dataItem.parent_no) {
                item.Items.push(dataItem);
            }
        });

        if (sortBySeqData[0].level == item.level) {
            ColData.push(item);
        }
    });
    return ColData;
};
