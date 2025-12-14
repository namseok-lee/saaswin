import React from 'react';
import { Stack, Divider } from '@mui/material';
import {
    GridColumnMenuProps,
    GridColumnMenuSortItem,
    GridColumnMenuPinningItem,
    GridColumnMenuFilterItem,
} from '@mui/x-data-grid-premium';

/**
 * 커스텀 컬럼 메뉴 컴포넌트
 * 그리드 컬럼 헤더에 표시되는 메뉴를 정의합니다.
 */
function CustomColumnMenu(props: GridColumnMenuProps) {
    const itemProps = {
        colDef: props.colDef,
        onClick: props.hideMenu,
    };

    return (
        <React.Fragment>
            <Stack px={0.5} py={0.5}>
                <GridColumnMenuSortItem {...itemProps} />
            </Stack>
            <Divider />
            <Stack px={0.5} py={0.5}>
                <GridColumnMenuPinningItem {...itemProps} />
            </Stack>
            <Divider />
            <Stack px={0.5} py={0.5}>
                <GridColumnMenuFilterItem {...itemProps} />
            </Stack>
        </React.Fragment>
    );
}

export default CustomColumnMenu;
