export const customData = (data = [], header = []) => {
    header.map((item, index) => {
        const customtext = item.customtext;

        if (item.type === 'CHECKBOX' && item.id !== 'cbox') {
            data.map((dataItem, dataIndex) => {
                if (dataItem[item.id] === 'Y') {
                    dataItem[item.id] = '1';
                } else if (dataItem[item.id] === 'N') {
                    dataItem[item.id] = '0';
                }
            });
        }

        if (customtext !== null) {
            const name = item.id;
            let str = '';
            const result = customtext.split('$');
            data.map((dataItem, dataIndex) => {
                for (let i = 0; i < result.length; i++) {
                    if (result[i] === '(') {
                        str += '(';
                    } else if (result[i] === ')') {
                        str += ')';
                    } else if (result[i] === ' ') {
                        str += ' ';
                    } else if (result[i] !== '') {
                        if (dataItem[result[i]] !== undefined) {
                            str += dataItem[result[i]];
                        } else {
                            str = '';
                            break;
                        }
                    }
                }

                dataItem[name] = str;
                str = '';
            });
        }
    });

    return data;
};
