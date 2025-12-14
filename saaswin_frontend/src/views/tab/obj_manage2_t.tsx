'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Stack, Avatar, Typography, IconButton, Grid, Tooltip, Box } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { treeData } from 'data/treeBinding';
import { fetcherPost } from 'utils/axios';
import SearchCondition from 'components/SearchCondition';
import Loader from 'components/Loader';
import CustomButton from 'components/CustomButton';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';

// react-organizational-chart 컴포넌트를 동적으로 로드하며 SSR을 비활성화
const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
    ssr: false,
});
const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
    ssr: false,
});

const HumanTiles = ({ data, onToggle, isCollapsed }) => {
    return (
        <Stack
            sx={{
                padding: '10px',
                borderRadius: '8px',
                bgcolor: 'white',
                display: 'inline-block',
                border: 1,
                position: 'relative',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={'/api/image/' + data.url} sx={{ width: 40, height: 40, borderRadius: 50 }} />
                <Stack alignItems="flex-start" sx={{ width: 150, height: 80, borderRadius: 50 }}>
                    <Typography sx={{ fontSize: 12 }}>{data.corp_nm}</Typography>
                    <Typography color="#475467" sx={{ fontSize: 12 }}>
                        {data.ognz_nm}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontWeight: 600 }}>{data.name}</Typography>
                        {/* <Typography color="#475467" sx={{ fontSize: 12 }}>
                            {data.designation}
                        </Typography> */}
                        <Typography color="#475467" sx={{ fontSize: 12 }}>
                            {data.jbps_nm}
                        </Typography>
                    </Stack>
                </Stack>
                {onToggle && (
                    <IconButton onClick={onToggle} sx={{ ml: 1 }}>
                        {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                )}
            </Stack>
        </Stack>
    );
};
interface MasterUIData {
    data_se_info: any[]; // 데이터 타입에 맞게 수정
    grid_tit_info: any[];
    grid_btn_info: any; // 데이터 타입에 맞게 수정
    grid_info: any; // 데이터 타입에 맞게 수정
    scr_url: string;
    scr_no: string;
}
export default function StyledTreeExample({ TabmasterUI }: { TabmasterUI: MasterUIData[] }) {
    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
    }

    const [nodeDataState, setNodeDataState] = useState(null);
    const tpcdParam = TabmasterUI?.scr_no;
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [dataLoading, setDataLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const searchParams = new URLSearchParams(useSearchParams());

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    const sortBySeqBtn = {
        api: 'null',
        seq: '1',
        text: '다운로드',
        type: 'DOWNLOAD',
        sqlId: 'null',
    };

    // 버튼 타입별 Handler 실행
    const handleClick = (item: []) => {
        if (nodeDataState) {
            generatePDF();
        }
    };

    useEffect(() => {
        if (TabmasterUI) {
            setMasterUI(TabmasterUI);
            setDataLoading(false);
        }
    }, [TabmasterUI]);

    // 조회버튼 누르면 실행
    useEffect(() => {
        if (masterRetrieve) {
            const item = dataParam?.master;
            fetcherPost([process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL, item])
                .then((response) => {
                    // 계층적 json으로 데이터 가공 후, items -> children으로 이름변경후 state에 넣어줌
                    const nodeData = convertItemsToChildren(treeData(response[0].data))[0];
                    setNodeDataState(nodeData);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        }
    }, [masterRetrieve]);

    useEffect(() => {
        if (nodeDataState) {
            setMasterRetrieve(false);
        }
    }, [nodeDataState]);

    // items 이름을 children으로 변경 (react-sortable-tree 는 하위노드는 children이라는 이름이 반드시 와야함)
    const convertItemsToChildren = (data) => {
        return data.map((item) => {
            const newItem = { ...item };

            // Items가 존재하면 children으로 이름을 변경하고 재귀 호출
            if (newItem.Items) {
                newItem.children = convertItemsToChildren(newItem.Items);
                delete newItem.Items; // 원래의 Items 속성 삭제
            }

            return newItem;
        });
    };

    const handleToggleNode = (node, event) => {
        node.iscollapsed = !node.iscollapsed;
        setIsCollapsed((prev) => !prev);
        setNodeDataState({ ...nodeDataState });
    };

    const traverseChildren = (children) => {
        return children.map((child) =>
            child.children && child.children.length > 0 ? (
                <TreeNode
                    key={child.flnm}
                    label={
                        <HumanTiles
                            data={{
                                name: child.flnm,
                                designation: child['user_info|jbttl_nm'],
                                jbps_nm: child['user_info|jbps_nm'],
                                url: child['user_info|img_nm'],
                                ognz_nm: child['ognz_info|ognz_nm'],
                                corp_nm: child['ognz_info|corp_nm'],
                            }}
                            isCollapsed={child.iscollapsed}
                            onToggle={
                                child.children && child.children.length > 0
                                    ? () => handleToggleNode(child, event)
                                    : null
                            }
                        />
                    }
                    style={{
                        display: child.iscollapsed ? 'none' : 'block', // 자식 숨기기
                    }}
                >
                    {child.children &&
                        child.children.length > 0 &&
                        !child.iscollapsed &&
                        traverseChildren(child.children)}
                </TreeNode>
            ) : (
                <TreeNode
                    key={child.flnm}
                    label={
                        <HumanTiles
                            data={{
                                name: child.flnm,
                                designation: child['user_info|jbttl_nm'],
                                jbps_nm: child['user_info|jbps_nm'],
                                url: child['user_info|img_nm'],
                                ognz_nm: child['ognz_info|ognz_nm'],
                                corp_nm: child['ognz_info|corp_nm'],
                            }}
                        />
                    }
                ></TreeNode>
            )
        );
    };

    const boxRef = useRef();

    const generatePDF = async () => {
        const today = dayjs(new Date()).format('YYYYMMDD');
        const element = boxRef.current;
        const pdf = new jsPDF('l', 'mm', 'b4');

        const canvas = await html2canvas(element, {
            scale: 2,
            scrollX: 0,
            scrollY: 0,
            useCORS: true, // 크로스도메인 이미지 문제 해결
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png'); // 이미지 데이터 추출

        // Box 전체 크기 계산
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = pageWidth / imgWidth;
        const finalHeight = imgHeight * ratio;

        let position = 0;
        while (position < finalHeight) {
            pdf.addImage(imgData, 'PNG', 0, -position * ratio, pageWidth, finalHeight);
            if (position + pageHeight < finalHeight) {
                pdf.addPage();
            }
            position += pageHeight;
        }

        pdf.save('조직도_' + today + '.pdf');
    };

    if (dataLoading) return <Loader />;

    return (
        <Grid container spacing={2}>
            {/* title , search button , sesarch box */}
            <Grid item xs={12}>
                <SearchCondition
                    masterUIinfo={masterUI}
                    tpcdParam={tpcdParam}
                    dataParam={dataParam}
                    searchParam={searchParams}
                    setDataParam={setDataParam}
                    handleSubmit={handleSubmit}
                    setDisplay={''}
                />
            </Grid>
            {/* grid title , grid description , grid */}
            <Grid item xs={12}>
                <Stack direction={'row'} sx={{ justifyContent: 'flex-end' }}>
                    <Stack direction={'row'}>
                        <CustomButton
                            key={sortBySeqBtn.seq}
                            customButton={sortBySeqBtn}
                            clickEvent={() => handleClick(sortBySeqBtn)}
                        />
                    </Stack>
                </Stack>
                <Box
                    ref={boxRef}
                    sx={{
                        display: 'flex',
                        maxWidth: '100%',
                        height: '100%',
                        overflowX: 'auto',
                        marginTop: '10px',
                        padding: '15px 30px', // 박스 내부 여백
                    }}
                >
                    {nodeDataState && (
                        <Tree
                            lineWidth={'3px'}
                            lineColor={'#0070D2'}
                            lineBorderRadius={'10px'}
                            label={
                                <HumanTiles
                                    data={{
                                        name: nodeDataState.flnm,
                                        designation: nodeDataState['user_info|jbttl_nm'],
                                        jbps_nm: nodeDataState['user_info|jbps_nm'],
                                        url: nodeDataState['user_info|img_nm'],
                                        ognz_nm: nodeDataState['ognz_info|ognz_nm'],
                                        corp_nm: nodeDataState['ognz_info|corp_nm'],
                                    }}
                                />
                            }
                        >
                            {nodeDataState.children && traverseChildren(nodeDataState.children)}
                        </Tree>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}
