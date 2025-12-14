import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import Typography from 'components/Typography';

interface GridContextMenuProps {
    anchorEl: boolean;
    contextMenu: {
        mouseX: number;
        mouseY: number;
        row: Record<string, any>;
    } | null;
    handleAnchor: () => void;
    handleAddRow: () => void;
    handleDeleteRow: () => void;
}

function GridContextMenu({ anchorEl, contextMenu, handleAnchor, handleAddRow, handleDeleteRow }: GridContextMenuProps) {
    return (
        <Menu
            open={Boolean(anchorEl)}
            onClose={handleAnchor}
            anchorReference='anchorPosition'
            anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
            aria-hidden={false}
            slotProps={{
                root: {
                    onContextMenu: (event) => {
                        event.preventDefault();
                        handleAnchor();
                    },
                },
            }}
        >
            <MenuItem onClick={handleAddRow}>추가</MenuItem>
            <MenuItem onClick={handleDeleteRow}>
                <Typography>삭제</Typography>
            </MenuItem>
        </Menu>
    );
}

export default GridContextMenu;
