// types/dabeng__react-orgchart.d.ts

declare module '@dabeng/react-orgchart' {
    import { Component, ReactNode } from 'react';

    interface TreeNode {
        id: string | number;
        name: string;
        children?: TreeNode[];
        [key: string]: any;
    }

    interface OrgChartProps {
        tree: TreeNode;
        NodeComponent?: React.ComponentType<any>;
        lineColor?: string;
        lineWidth?: number;
        margin?: number;
    }

    export default class OrgChart extends Component<OrgChartProps> {}
}
