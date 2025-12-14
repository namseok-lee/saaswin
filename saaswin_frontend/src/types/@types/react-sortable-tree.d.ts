// types/react-sortable-tree.d.ts

declare module 'react-sortable-tree' {
    import * as React from 'react';

    export interface TreeNode {
        title: string | React.ReactNode;
        subtitle?: string | React.ReactNode;
        expanded?: boolean;
        children?: TreeNode[];
        [key: string]: any;
    }

    export interface SortableTreeProps {
        treeData: TreeNode[];
        onChange: (treeData: TreeNode[]) => void;
        generateNodeProps?: (rowInfo: any) => any;
        canDrag?: (rowInfo: any) => boolean;
        canDrop?: (args: any) => boolean;
        theme?: any;
        [key: string]: any;
    }

    export default class SortableTree extends React.Component<SortableTreeProps> {}
}
