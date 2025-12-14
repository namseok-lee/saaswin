import React, { useState, useEffect, useCallback } from 'react';
// Import DataGrid and GridToolbar from the premium package to enable Excel export
import {
    DataGridPremium as DataGrid,
    GridToolbar,
    GridActionsCellItem,
    GridRowModes,
    GridRowEditStopReasons,
    useGridApiRef,
} from '@mui/x-data-grid-premium';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button'; // For Add button
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid'; // For generating temporary IDs for new rows
import { fetcherPostData, fetcherPost } from '../utils/axios'; // Import fetcherPostData and fetcherPost
// MUI Modal Components
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar
import CircularProgress from '@mui/material/CircularProgress'; // For modal loading
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// Helper function to format date and time
const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

const initialAiFormData = { dd_kind: '', std_key: '', std_val: '', korn_nm: '' };

const ddKindOptions = ['단어', '용어', '팝업', '메세지']; // Define options

function RedisDdViewer() {
    const apiRef = useGridApiRef(); // Create API ref
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false); // Loading state for save/delete operations
    const [error, setError] = useState(null); // Keep error state as null or string
    const [pageSize, setPageSize] = useState(10); // State for page size
    const [page, setPage] = useState(0); // State for current page
    const [pageSizeInputError, setPageSizeInputError] = useState(''); // State for input validation error
    const [rowModesModel, setRowModesModel] = useState({}); // State for row edit modes
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // For feedback messages
    // AI Modal state
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiFormData, setAiFormData] = useState(initialAiFormData);
    const [aiModalLoading, setAiModalLoading] = useState(false); // Loading state specific to AI modal submission
    const [aiModalError, setAiModalError] = useState(''); // Error state specific to AI modal

    // Handlers for row editing (will be defined later)
    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
        // processRowUpdate will be triggered automatically
    };

    const handleDeleteClick = (id) => async () => {
        if (window.confirm('정말로 이 행을 삭제하시겠습니까?')) {
            const rowToDelete = data.find((row) => row.id === id);
            if (!rowToDelete || !rowToDelete.std_key || !rowToDelete.dd_kind) {
                // Ensure dd_kind is also present
                setSnackbar({ open: true, message: '삭제할 행의 키 또는 종류를 찾을 수 없습니다.', severity: 'error' });
                return;
            }
            // Pass action, key (std_key), and dd_kind for DELETE
            const operations = [
                {
                    action: 'DELETE',
                    key: rowToDelete.std_key,
                    dd_kind: rowToDelete.dd_kind,
                },
            ];
            try {
                await saveRedisDdChanges(operations);
                setData(data.filter((row) => row.id !== id));
                setSnackbar({ open: true, message: '행이 성공적으로 삭제되었습니다.', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: `삭제 중 오류 발생: ${err.message}`, severity: 'error' });
            }
        }
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
        const editedRow = data.find((row) => row.id === id);
        if (editedRow?.isNew) {
            setData(data.filter((row) => row.id !== id));
        }
    };

    // Function to process row updates (updated to include AI generation for INSERT)
    const processRowUpdate = async (newRow, oldRow) => {
        const action = newRow.isNew ? 'INSERT' : 'UPDATE';

        // --- INSERT action (Direct Add Button) ---
        if (action === 'INSERT') {
            setApiLoading(true); // Start loading
            try {
                // 1. Validate required user input (same as before)
                if (!newRow.dd_kind || !newRow.std_key || !newRow.std_val || !newRow.korn_nm) {
                    throw new Error('DD 종류, 표준 키, 표준 값, 한글 이름은 필수 입력입니다.');
                }

                // 2. Prepare for DB save (remove grid-specific fields)
                // Use the user's input directly, NO AI call needed for Direct Add.
                const dbSaveData = { ...newRow };
                delete dbSaveData.id;
                delete dbSaveData.isNew;

                // 3. Call the DB save API directly with user input
                const operations = [
                    {
                        action: action,
                        key: dbSaveData.std_key, // Use std_key from user input
                        value: dbSaveData, // Pass the user-entered data
                    },
                ];
                await saveRedisDdChanges(operations); // Call the DB save function

                // 4. Update local state and provide feedback
                const finalRow = { ...newRow, id: newRow.id, isNew: false }; // Keep grid id, mark as not new
                setData(data.map((row) => (row.id === newRow.id ? finalRow : row)));
                setSnackbar({
                    open: true,
                    message: '행이 성공적으로 추가되었습니다.', // Adjusted message for direct add
                    severity: 'success',
                });
                return finalRow; // Return the final row data to the grid
            } catch (err) {
                setSnackbar({ open: true, message: `저장 중 오류 발생: ${err.message}`, severity: 'error' });
                // Revert UI changes on error
                setData((prevData) => prevData.filter((row) => row.id !== newRow.id));
                setRowModesModel((prevModel) => {
                    const newModel = { ...prevModel };
                    delete newModel[newRow.id];
                    return newModel;
                });
                return null; // Signal revert
            } finally {
                setApiLoading(false); // Stop loading
            }
        } else {
            // --- UPDATE action (existing logic, no changes needed here) ---
            try {
                const updatedRowData = { ...newRow };
                delete updatedRowData.id;
                delete updatedRowData.isNew;
                if (!newRow.std_key || !newRow.dd_kind) {
                    throw new Error('표준 키(std_key)와 DD 종류(dd_kind)는 필수입니다.');
                }
                const operations = [{ action: action, key: newRow.std_key, value: updatedRowData }];
                await saveRedisDdChanges(operations);
                const finalRow = { ...newRow, isNew: false };
                setData(data.map((row) => (row.id === newRow.id ? finalRow : row)));
                setSnackbar({ open: true, message: '행이 성공적으로 수정되었습니다.', severity: 'success' });
                return finalRow;
            } catch (err) {
                setSnackbar({ open: true, message: `저장 중 오류 발생: ${err.message}`, severity: 'error' });
                return oldRow; // Revert UI changes on error
            }
        }
    };

    const handleProcessRowUpdateError = useCallback((error) => {
        setSnackbar({ open: true, message: `오류: ${error.message}`, severity: 'error' });
    }, []);

    // Function to handle adding a new row
    const handleAddClick = () => {
        const id = uuidv4(); // Generate temporary unique ID
        const newRow = {
            id,
            // Initialize fields - adjust defaults as needed
            dd_kind: '',
            std_key: '',
            std_val: '',
            korn_nm: '',
            korn_expln: '',
            eng_nm: '',
            cnl_nm: '',
            jpl_nm: '',
            ctfl_nm: '',
            eng_expln: '',
            cnl_expln: '',
            jpl_expln: '',
            ctfl_expln: '',
            isNew: true, // Flag to identify new row
        };
        setData((oldRows) => [newRow, ...oldRows]); // Add to top
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'dd_kind' }, // Focus first editable field
        }));
        // Optionally scroll to the new row
        apiRef.current.scrollToIndexes({ rowIndex: 0 });
    };

    // API Call Wrapper function (updated for new API spec)
    const saveRedisDdChanges = async (operations) => {
        // Transform operations into the required API data format
        const apiData = operations.map((op) => {
            if (op.action === 'DELETE') {
                return {
                    action: op.action,
                    dd_kind: op.dd_kind,
                    std_key: op.key, // Assuming op.key holds std_key for delete
                };
            } else {
                // INSERT or UPDATE
                // Make sure all necessary fields are included
                // The 'value' object passed from processRowUpdate contains all fields
                return {
                    action: op.action,
                    dd_kind: op.value.dd_kind,
                    std_key: op.key, // Assuming op.key holds std_key for insert/update
                    // Add all other relevant fields from the row data (op.value)
                    dd_num: op.value.dd_num,
                    std_val: op.value.std_val,
                    korn_nm: op.value.korn_nm,
                    korn_expln: op.value.korn_expln,
                    eng_nm: op.value.eng_nm,
                    eng_expln: op.value.eng_expln,
                    jpl_nm: op.value.jpl_nm,
                    jpl_expln: op.value.jpl_expln,
                    cnl_nm: op.value.cnl_nm,
                    cnl_expln: op.value.cnl_expln,
                    ctfl_nm: op.value.ctfl_nm,
                    ctfl_expln: op.value.ctfl_expln,
                    // Add any other fields that exist in your grid/API
                };
            }
        });

        const requestBody = [
            {
                sqlId: 'hrs_com01', // !! Placeholder - Verify !!
                sql_key: 'redis_dd_set',
                params: [
                    {
                        // work_user_no, rprs_ognz_no are expected to be added by fetcherPost
                        data: apiData,
                    },
                ],
            },
        ];
        console.log('Sending API Request:', JSON.stringify(requestBody, null, 2));
        setApiLoading(true);
        try {
            // Use fetcherPost directly as it handles common params injection
            const response = await fetcherPost(['/api/ssw/0022', requestBody]);
            console.log('API Response:', response);
            // Assuming fetcherPost returns the resData part directly based on axios.js
            const resData = response?.[0]?.data;
            if (resData?.err_json?.length > 0) {
                const errorMessages = resData.err_json
                    .map((e) => `Key '${e.std_key || e.key}': ${e.error_msg}`)
                    .join('; '); // Adjust key access based on error response
                throw new Error(`일부 작업 실패: ${errorMessages}`);
            }
            console.log('API call successful (err_json empty)');
            return response;
        } catch (error) {
            console.error('saveRedisDdChanges Error:', error);
            throw error;
        } finally {
            setApiLoading(false);
        }
    };

    // AI API Call function (assuming backend endpoint /api/ai/generate-term exists)
    const generateTermDetails = async (termInfo) => {
        try {
            console.log('Calling AI API with fetch:', termInfo);
            const response = await fetch('/api/ai/generate-term', {
                // Use standard fetch
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(termInfo), // Send data as JSON string
            });

            if (!response.ok) {
                // Handle HTTP errors (e.g., 404, 500)
                const errorText = await response.text(); // Try to get error message from response body
                throw new Error(
                    `AI API request failed with status ${response.status}: ${errorText || response.statusText}`
                );
            }

            const responseData = await response.json(); // Parse JSON response

            if (!responseData) {
                // Check if responseData is falsy after parsing
                throw new Error('AI API returned an empty or invalid JSON response.');
            }
            console.log('Received from AI API via fetch:', responseData);
            return responseData;
        } catch (error) {
            console.error('AI API 호출 실패 (fetch): ', error);
            // Ensure the error message passed up is helpful
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`AI 용어 생성에 실패했습니다: ${errorMessage}`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const payload = [
                    {
                        sqlId: 'hrs_com01',
                        sql_key: 'redisdd_get_all',
                        params: [{}],
                    },
                ];

                const apiResult = await fetcherPostData(payload);
                console.log('API Result (is the data array):', apiResult); // Log确认apiResult就是数据数组

                // Process the extracted data array, using snake_case fields
                const processedApiData = (apiResult || [])
                    .filter((row) => row != null)
                    .map((row, index) => ({
                        // Add index parameter to map
                        ...row,
                        // Use snake_case fields for ID generation, include index for robustness
                        id: `${row.dd_kind ?? `kind-${index}`}-${row.std_key ?? `key-${index}`}`,
                        isNew: false, // Ensure existing rows are not marked as new
                    }));

                console.log('Processed Data with IDs:', processedApiData);
                setData(processedApiData);
            } catch (err) {
                let errorMessage = '알 수 없는 오류가 발생했습니다.';
                let errorStatus = '';
                if (err instanceof Error) {
                    errorMessage = err.message;
                    // Check if status exists on the error object (custom property from axios interceptor)
                    if ('status' in err && err.status) {
                        errorStatus = ` (Status: ${err.status})`;
                    }
                }
                setError(`데이터를 불러오는 데 실패했습니다: ${errorMessage}${errorStatus}`);
                console.error('API 호출 오류:', err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handler for page size input change
    const handlePageSizeChange = (event) => {
        const value = event.target.value;
        if (value === '') {
            setPageSizeInputError(''); // Clear error if input is empty
            // Optionally set a default page size or handle empty input case
            setPageSize(10); // Example: Reset to default
            setPage(0); // Reset page when size changes
            return;
        }

        const numValue = parseInt(value, 10);

        if (isNaN(numValue)) {
            setPageSizeInputError('숫자만 입력해주세요.');
        } else if (numValue >= 10 && numValue <= 100) {
            setPageSizeInputError(''); // Clear error on valid input
            setPageSize(numValue);
            setPage(0); // Reset page when size changes
        } else {
            setPageSizeInputError('페이지 크기는 10에서 100 사이여야 합니다.');
        }
    };

    // Handler for DataGrid pagination model changes
    const handlePaginationModelChange = useCallback((model) => {
        setPage(model.page);
        setPageSize(model.pageSize);
    }, []);

    // --- AI Modal Handlers ---
    const handleAiModalOpen = () => {
        setAiFormData(initialAiFormData); // Reset form on open
        setAiModalError(''); // Clear previous errors
        setIsAiModalOpen(true);
    };
    const handleAiModalClose = () => {
        if (aiModalLoading) return; // Prevent closing while loading
        setIsAiModalOpen(false);
    };
    const handleAiFormChange = (event) => {
        const { name, value } = event.target;
        setAiFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleAiModalSubmit = async () => {
        setAiModalError(''); // Clear previous errors
        // Basic Validation
        if (!aiFormData.dd_kind || !aiFormData.std_key || !aiFormData.std_val || !aiFormData.korn_nm) {
            setAiModalError('모든 필수 필드를 입력해주세요.');
            return;
        }

        setAiModalLoading(true);
        try {
            // 1. Call AI API
            const aiGeneratedData = await generateTermDetails(aiFormData);

            // 2. Merge data
            const enrichedRowData = {
                ...aiFormData, // User input
                ...aiGeneratedData, // AI results
                // Re-apply user input just in case AI returns them
                dd_kind: aiFormData.dd_kind,
                std_key: aiFormData.std_key,
                std_val: aiFormData.std_val,
                korn_nm: aiFormData.korn_nm,
            };

            // 3. Prepare for DB save
            const dbSaveData = { ...enrichedRowData };
            // (No need to delete id/isNew as this is a new object)

            // 4. Call DB save API
            const operations = [
                {
                    action: 'INSERT',
                    key: dbSaveData.std_key,
                    value: dbSaveData,
                },
            ];
            await saveRedisDdChanges(operations);

            // 5. Update local state & UI
            const newGridRow = {
                ...enrichedRowData,
                id: uuidv4(), // Add a unique ID for the grid row
                isNew: false, // Mark as saved
            };
            setData((prevData) => [newGridRow, ...prevData]); // Add to the top of the grid
            setSnackbar({ open: true, message: 'AI 용어가 성공적으로 추가되었습니다.', severity: 'success' });
            handleAiModalClose(); // Close modal on success
        } catch (err) {
            console.error('AI Modal Submit Error:', err);
            setAiModalError(`오류: ${err.message}`); // Show error in modal
            setSnackbar({ open: true, message: `AI 용어 추가 실패: ${err.message}`, severity: 'error' });
        } finally {
            setAiModalLoading(false);
        }
    };

    // --- Snackbar close handler ---
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading && data.length === 0) {
        return <div>로딩 중...</div>;
    }

    const excelFilename = `용어사전_${getFormattedDateTime()}`;

    // Define columns inside the component
    const columns = [
        // Update dd_kind column definition for singleSelect type
        {
            field: 'dd_kind',
            headerName: 'DD 종류',
            width: 150,
            editable: true,
            type: 'singleSelect', // Set type to singleSelect
            valueOptions: ddKindOptions, // Provide the options array
        },
        { field: 'std_key', headerName: '표준 키', width: 150, editable: (params) => params.row.isNew },
        { field: 'std_val', headerName: '표준 값', width: 150, editable: true },
        { field: 'korn_nm', headerName: '한글 이름', width: 200, editable: true },
        { field: 'korn_expln', headerName: '한글 설명', flex: 1, editable: true },
        // Add columns for other languages
        { field: 'eng_nm', headerName: '영어 이름', width: 200, editable: true },
        { field: 'cnl_nm', headerName: '중국어(간체) 이름', width: 200, editable: true },
        { field: 'jpl_nm', headerName: '일본어 이름', width: 200, editable: true },
        { field: 'ctfl_nm', headerName: '중국어(번체) 이름', width: 200, editable: true },
        // Uncomment and add explanation columns
        { field: 'eng_expln', headerName: '영어 설명', flex: 1, editable: true },
        { field: 'cnl_expln', headerName: '중국어(간체) 설명', flex: 1, editable: true },
        { field: 'jpl_expln', headerName: '일본어 설명', flex: 1, editable: true },
        { field: 'ctfl_expln', headerName: '중국어(번체) 설명', flex: 1, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: '작업',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            key="save"
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{ color: 'primary.main' }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            key="cancel"
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Button color="primary" variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
                        행 직접 추가
                    </Button>
                    <Button
                        color="secondary"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAiModalOpen}
                        sx={{ ml: 1 }}
                    >
                        AI 용어 추가
                    </Button>
                </Box>
                <Box sx={{ width: '200px' }}>
                    <TextField
                        label="페이지당 행 수 (10-100)"
                        type="number"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={!!pageSizeInputError}
                        helperText={pageSizeInputError}
                        inputProps={{ min: 10, max: 100 }}
                    />
                </Box>
            </Box>
            {error && !isAiModalOpen && (
                <Alert severity="error" sx={{ mb: 1 }}>
                    오류: {error}
                </Alert>
            )}
            <Box sx={{ flexGrow: 1, width: '100%' }}>
                {data.length === 0 && !loading ? (
                    <p>표시할 데이터가 없습니다.</p>
                ) : (
                    <DataGrid
                        apiRef={apiRef}
                        rows={data}
                        columns={columns}
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={setRowModesModel}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        loading={apiLoading || (loading && data.length === 0)}
                        pagination
                        paginationMode="client"
                        pageSizeOptions={[10, 25, 50, 100]}
                        paginationModel={{ page, pageSize }}
                        onPaginationModelChange={handlePaginationModelChange}
                        checkboxSelection={false}
                        disableRowSelectionOnClick
                        slots={{
                            toolbar: GridToolbar,
                        }}
                        slotProps={{
                            toolbar: {
                                excelOptions: {
                                    fileName: excelFilename,
                                },
                            },
                        }}
                    />
                )}
            </Box>

            {/* AI Add Term Modal */}
            <Dialog
                open={isAiModalOpen}
                onClose={handleAiModalClose}
                aria-labelledby="ai-term-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="ai-term-dialog-title">AI 용어 추가</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        아래 필수 정보를 입력하면 AI가 나머지 설명을 생성합니다.
                    </DialogContentText>
                    {aiModalError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {aiModalError}
                        </Alert>
                    )}
                    <FormControl variant="standard" fullWidth required margin="dense">
                        <InputLabel id="dd_kind-select-label">DD 종류</InputLabel>
                        <Select
                            labelId="dd_kind-select-label"
                            id="dd_kind-select"
                            name="dd_kind"
                            value={aiFormData.dd_kind}
                            onChange={handleAiFormChange}
                            label="DD 종류"
                        >
                            {ddKindOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="std_key"
                        name="std_key"
                        label="표준 키"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={aiFormData.std_key}
                        onChange={handleAiFormChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="std_val"
                        name="std_val"
                        label="표준 값"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={aiFormData.std_val}
                        onChange={handleAiFormChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="korn_nm"
                        name="korn_nm"
                        label="한글 이름"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={aiFormData.korn_nm}
                        onChange={handleAiFormChange}
                        required
                    />
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    {' '}
                    {/* Add padding */}
                    <Button onClick={handleAiModalClose} disabled={aiModalLoading}>
                        취소
                    </Button>
                    <Button onClick={handleAiModalSubmit} variant="contained" disabled={aiModalLoading}>
                        {aiModalLoading ? <CircularProgress size={24} /> : '저장 (AI 생성)'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default RedisDdViewer;
