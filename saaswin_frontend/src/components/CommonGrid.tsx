'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
    DataGridPro,
    GridColDef,
    GridColumnGroupingModel,
    GridToolbarContainer,
    GridToolbarExport,
} from '@mui/x-data-grid-pro';

import { Button, Stack } from '@mui/material';
import ExcelUpload from './ExcelUpload';
import ExcelDownload from './ExcelDownload';

const rows = [
    { id: '1', isAdmin: false, lastName: 'Snow', firstName: 'Jon', age: '14' },
    { id: '2', isAdmin: true, lastName: 'Lannister', firstName: 'Cersei', age: '31' },
    { id: '3', isAdmin: false, lastName: 'Lannister', firstName: 'Jaime', age: '31' },
    { id: '4', isAdmin: false, lastName: 'Stark', firstName: 'Arya', age: '11' },
    { id: '5', isAdmin: true, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: '6', isAdmin: true, lastName: 'Melisandre', firstName: null, age: '150' },
    { id: '7', isAdmin: false, lastName: 'Clifford', firstName: 'Ferrara', age: '44' },
    { id: '8', isAdmin: false, lastName: 'Frances', firstName: 'Rossini', age: '36' },
    { id: '9', isAdmin: false, lastName: 'Roxie', firstName: 'Harvey', age: '65' },
];

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'isAdmin', type: 'boolean', headerName: 'is admin', width: 100 },
    {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
    },
    {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => (
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    console.log(`Clicked on row with ID: ${params.id}`);
                }}
            >
                Click Me
            </Button>
        ),
    },
];

const columnGroupingModel: GridColumnGroupingModel = [
    {
        groupId: 'internal_data',
        headerName: 'Internal (not freeReordering)',
        description: '',
        children: [{ field: 'id' }, { field: 'isAdmin' }],
    },
    {
        groupId: 'naming',
        headerName: 'Full name (freeReordering)',
        freeReordering: true,
        children: [{ field: 'lastName' }, { field: 'firstName' }],
    },
];
const downloadExcel = (data) => {
    const formattedData = data.map((row) => ({
        ...row,
        isAdmin: row.isAdmin === 'true' || row.isAdmin === true ? true : false,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, 'saaswin.xlsx');
};
function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}
export default function BreakingGroupDemo() {
    const [data, setData] = useState(rows);
    return (
        <div style={{ width: '100%' }}>
            <Stack direction={'row'}>
                <ExcelUpload setData={setData} />
                <ExcelDownload data={data} />
            </Stack>
            <DataGridPro
                rows={data}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                columnGroupingModel={columnGroupingModel}
                slots={{
                    toolbar: CustomToolbar,
                }}
            />
        </div>
    );
}
