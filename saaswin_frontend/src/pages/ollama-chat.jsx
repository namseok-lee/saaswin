'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
// --- Use MUI components and Icons ---
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'; // Keep for potential future use or reference
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert'; // Use MUI Alert for errors instead of custom Snackbar
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton'; // For theme toggle button
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery'; // 반응형 디자인을 위한 추가
import Zoom from '@mui/material/Zoom'; // 애니메이션을 위한 추가
import Fade from '@mui/material/Fade'; // 애니메이션을 위한 추가
import { alpha } from '@mui/material/styles'; // 색상 조정을 위한 추가
import InputAdornment from '@mui/material/InputAdornment';
// MUI Icons
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // User Icon
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Bot Icon
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Light Mode Icon
import Brightness2Icon from '@mui/icons-material/Brightness2'; // Dark Mode Icon
import MenuIcon from '@mui/icons-material/Menu';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// 추가 아이콘
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FeedbackIcon from '@mui/icons-material/Feedback';
import GradingIcon from '@mui/icons-material/Grading';
import LoadIcon from '@mui/icons-material/RestorePage'; // 불러오기 아이콘
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 영구 삭제 아이콘
import CloseIcon from '@mui/icons-material/Close'; // Snackbar 닫기용
import AddCommentIcon from '@mui/icons-material/AddComment'; // 새 채팅 아이콘
// 추가 컴포넌트 import
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar'; // 저장 확인용

// --- Use existing custom components ---
// import TextInput from '../components/TextInput'; // Replaced with MUI TextField
// import Button from '../components/Button'; // Replaced with MUI IconButton
import Loader from '../components/Loader'; // path: src/components/Loader.tsx
// import Snackbar from "../components/Snackbar";   // Using MUI Alert instead for consistency

// --- Enhanced Theme Definitions ---
const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                  // 라이트 모드 테마
                  primary: {
                      main: '#3f51b5', // 푸른 계열의 메인 컬러
                      dark: '#303f9f',
                      light: '#7986cb',
                      contrastText: '#fff',
                  },
                  secondary: {
                      main: '#f50057', // 핑크/레드 계열의 강조색
                      dark: '#c51162',
                      light: '#ff4081',
                  },
                  background: {
                      default: '#f5f7fa',
                      paper: '#ffffff',
                      gradient: 'linear-gradient(120deg, #f0f2f5 0%, #ffffff 100%)',
                      messageUser: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                      messageBot: 'linear-gradient(135deg, #f5f7fa 0%, #e4e6eb 100%)',
                  },
                  text: {
                      primary: '#2c3e50',
                      secondary: '#546e7a',
                  },
                  divider: 'rgba(0, 0, 0, 0.08)',
              }
            : {
                  // 다크 모드 테마
                  primary: {
                      main: '#7986cb', // 라이트한 푸른색
                      dark: '#5c6bc0',
                      light: '#9fa8da',
                      contrastText: '#fff',
                  },
                  secondary: {
                      main: '#ff4081', // 핑크/레드 계열의 강조색 (더 밝게)
                      dark: '#f50057',
                      light: '#ff80ab',
                  },
                  background: {
                      default: '#121212',
                      paper: '#1e1e1e',
                      gradient: 'linear-gradient(120deg, #1e1e1e 0%, #2d2d2d 100%)',
                      messageUser: 'linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%)',
                      messageBot: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
                  },
                  text: {
                      primary: '#e0e0e0',
                      secondary: '#aaaaaa',
                  },
                  divider: 'rgba(255, 255, 255, 0.08)',
              }),
    },
    typography: {
        fontFamily: '"Pretendard", "Roboto", "Arial", sans-serif',
        h6: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: 'none',
                }),
                elevation1: ({ theme }) => ({
                    boxShadow:
                        theme.palette.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.5)',
                }),
                elevation2: ({ theme }) => ({
                    boxShadow:
                        theme.palette.mode === 'light' ? '0 3px 10px rgba(0,0,0,0.1)' : '0 3px 10px rgba(0,0,0,0.6)',
                }),
                elevation3: ({ theme }) => ({
                    boxShadow:
                        theme.palette.mode === 'light' ? '0 6px 20px rgba(0,0,0,0.12)' : '0 6px 20px rgba(0,0,0,0.7)',
                }),
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    boxShadow:
                        theme.palette.mode === 'light' ? '0 2px 5px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.5)',
                    border: `2px solid ${theme.palette.background.paper}`,
                }),
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor:
                                theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                            transition: 'border-color 0.3s ease-in-out',
                        },
                        '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '2px',
                        },
                    },
                }),
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '10px',
                        '&:hover': {
                            background: 'rgba(0,0,0,0.3)',
                        },
                    },
                },
            },
        },
    },
});

function OllamaChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

    // --- UI 상태 관리 (저장 관련 상태 제거) ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const menuOpen = Boolean(menuAnchorEl);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // --- Theme Mode State & Hydration Handling ---
    const [isMounted, setIsMounted] = useState(false);
    const [themeMode, setThemeMode] = useState('light');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            const savedMode = localStorage.getItem('themeMode');
            if (savedMode) {
                setThemeMode(savedMode);
            } else if (prefersDarkMode) {
                setThemeMode('dark');
            }
        }
    }, [isMounted, prefersDarkMode]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('themeMode', themeMode);
        }
    }, [themeMode, isMounted]);

    const handleThemeChange = () => {
        setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);

    // --- Scroll Logic ---
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        setTimeout(scrollToBottom, 50);
    }, [messages]);

    // --- Send Message Logic (자동 저장 로직 제거) ---
    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const newUserMessage = { role: 'user', content: input };
        const currentMessages = [...messages, newUserMessage];
        setMessages(currentMessages);
        setInput('');
        setLoading(true);
        setError(null);

        const messagesForApi = currentMessages.map((msg) => ({ role: msg.role, content: msg.content }));
        let currentAssistantMessage = '';
        let streamCompletedSuccessfully = false;

        setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

        try {
            const response = await fetch('/api/ai/ollama-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messagesForApi }),
            });
            if (!response.ok || !response.body) {
                let errorMsg = `Request failed with status ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData?.error || errorMsg;
                } catch (e) {
                    errorMsg = response.statusText || errorMsg;
                }
                setMessages((prev) => prev.slice(0, -1));
                throw new Error(errorMsg);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let firstChunk = true;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    try {
                        const jsonChunks = chunk.split('\n').filter((s) => s.trim() !== '');
                        jsonChunks.forEach((jsonChunk) => {
                            const parsed = JSON.parse(jsonChunk);
                            if (parsed.message && parsed.message.content) {
                                const contentPiece = parsed.message.content;
                                currentAssistantMessage += contentPiece;

                                setMessages((prev) => {
                                    const updated = [...prev];
                                    if (updated.length > 0) {
                                        const lastMsgIndex = updated.length - 1;
                                        if (updated[lastMsgIndex].role === 'assistant') {
                                            if (firstChunk) {
                                                updated[lastMsgIndex].content = contentPiece;
                                            } else {
                                                updated[lastMsgIndex].content += contentPiece;
                                            }
                                        }
                                    }
                                    return updated;
                                });
                                firstChunk = false;
                            }
                            if (parsed.done) {
                                done = true;
                            }
                        });
                    } catch (e) {
                        console.error('Error parsing stream chunk:', e, 'Chunk:', chunk);
                    }
                }
            }
            console.log('sendMessage: Stream loop finished.');
            streamCompletedSuccessfully = true;
            setMessages((prev) => {
                const finalState = [...currentMessages];
                finalState.push({ role: 'assistant', content: currentAssistantMessage });
                console.log('sendMessage: Setting final message state:', finalState);
                return finalState;
            });
        } catch (err) {
            console.error('sendMessage: Error during fetch/stream:', err);
            setError(err.message || 'Failed to get response from AI');
            setMessages((prev) =>
                prev.filter(
                    (msg, index) => !(index === prev.length - 1 && msg.role === 'assistant' && msg.content === '...')
                )
            );
        } finally {
            setLoading(false);
            console.log('sendMessage: Entering finally block.');
        }
    };

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const handleInputKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    // --- UI 이벤트 핸들러 (저장 관련 핸들러 제거/수정) ---
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleInfoOpen = () => {
        setInfoDialogOpen(true);
    };
    const handleInfoClose = () => {
        setInfoDialogOpen(false);
    };
    const handleSettingsOpen = () => {
        setSettingsDialogOpen(true);
        setDrawerOpen(false);
    };
    const handleSettingsClose = () => {
        setSettingsDialogOpen(false);
    };
    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    // handleClearChat: currentChatId 제거
    const handleClearChat = () => {
        setMessages([]);
        setInput('');
        handleMenuClose();
        setSnackbarMessage('현재 대화 내용이 삭제되었습니다.');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // handleNewChat: currentChatId 제거
    const handleNewChat = (showSnackbar = true) => {
        setMessages([]);
        setInput('');
        setError(null);
        setLoading(false);
        if (showSnackbar) {
            setSnackbarMessage('새 채팅을 시작합니다.');
            setSnackbarOpen(true);
        }
        setDrawerOpen(false);
        setMenuAnchorEl(null);
    };

    // --- Render Logic ---
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* 사이드 드로어: 대화 기록 섹션 제거 */}
            <Drawer
                anchor='left'
                open={drawerOpen}
                onClose={handleDrawerToggle}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                        backgroundImage:
                            themeMode === 'light'
                                ? 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)'
                                : 'linear-gradient(180deg, #121212 0%, #1e1e1e 100%)',
                    },
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        mb: 1,
                    }}
                >
                    <Typography
                        variant='h6'
                        sx={{
                            background:
                                themeMode === 'light'
                                    ? 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)'
                                    : 'linear-gradient(90deg, #7986cb 0%, #9fa8da 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700,
                        }}
                    >
                        WIN_AI 1.0 메뉴
                    </Typography>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {/* 대화 설정 항목 */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleSettingsOpen}>
                            <ListItemIcon>
                                {' '}
                                <SettingsIcon color='primary' />{' '}
                            </ListItemIcon>
                            <ListItemText primary='대화 설정' />
                        </ListItemButton>
                    </ListItem>

                    <Divider sx={{ my: 1 }} />
                    {/* 현재 대화 지우기 항목 */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleClearChat}>
                            <ListItemIcon>
                                {' '}
                                <DeleteIcon color='error' />{' '}
                            </ListItemIcon>
                            <ListItemText primary='현재 대화 지우기' primaryTypographyProps={{ color: 'error' }} />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', textAlign: 'center', mb: 1 }}
                    >
                        모델: gemma3:12b (로컬)
                    </Typography>
                    <Button variant='outlined' size='small' fullWidth onClick={handleDrawerToggle} sx={{ mb: 1 }}>
                        닫기
                    </Button>
                </Box>
            </Drawer>

            {/* 설정 다이얼로그 (변경 없음) */}
            <Dialog
                open={settingsDialogOpen}
                onClose={handleSettingsClose}
                aria-labelledby='settings-dialog-title'
                PaperProps={{ elevation: 5, sx: { borderRadius: 3, width: '90%', maxWidth: '500px' } }}
            >
                <DialogTitle id='settings-dialog-title'>
                    <Typography variant='h6' sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon color='primary' />
                        대화 설정
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant='body2' sx={{ mb: 2 }}>
                        AI 대화 관련 설정을 변경할 수 있습니다.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' gutterBottom>
                        AI 모델 설정
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        현재 사용 중인 모델: gemma3:12b
                    </Typography>
                    <Button variant='contained' sx={{ mt: 1 }} disabled>
                        모델 변경 (구현 예정)
                    </Button>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' gutterBottom>
                        기타 설정
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        추가 설정 항목이 여기에 표시됩니다.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button variant='outlined' onClick={handleSettingsClose} color='primary'>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                    backgroundImage:
                        themeMode === 'light'
                            ? 'radial-gradient(#e0e0e0 1px, transparent 1px)'
                            : 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}
            >
                {loading && <Loader />}
                <Paper
                    elevation={3}
                    square
                    sx={{
                        px: { xs: 2, sm: 3 },
                        py: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1100,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size='small'
                            color='inherit'
                            edge='start'
                            onClick={handleDrawerToggle}
                            aria-label='메뉴 열기'
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant='h6'
                            sx={{
                                background:
                                    themeMode === 'light'
                                        ? 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)'
                                        : 'linear-gradient(90deg, #7986cb 0%, #9fa8da 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 700,
                                letterSpacing: '0.02em',
                            }}
                        >
                            WIN_AI 1.0
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size='small'
                            color='inherit'
                            onClick={() => handleNewChat()}
                            aria-label='새 채팅 시작'
                            title='새 채팅 시작'
                        >
                            <AddCommentIcon />
                        </IconButton>
                        <IconButton
                            size='small'
                            color='inherit'
                            onClick={handleInfoOpen}
                            aria-label='정보 보기'
                            sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'rotate(15deg)' } }}
                        >
                            <InfoOutlinedIcon />
                        </IconButton>
                        {isMounted && (
                            <IconButton
                                onClick={handleThemeChange}
                                color='inherit'
                                size='small'
                                aria-label='테마 변경'
                                sx={{
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': { transform: 'rotate(180deg)' },
                                }}
                            >
                                {themeMode === 'light' ? <Brightness2Icon /> : <WbSunnyIcon />}
                            </IconButton>
                        )}
                        <IconButton
                            size='small'
                            color='inherit'
                            edge='end'
                            onClick={handleMenuOpen}
                            aria-label='더 많은 옵션'
                            aria-controls={menuOpen ? 'options-menu' : undefined}
                            aria-haspopup='true'
                            aria-expanded={menuOpen ? 'true' : undefined}
                        >
                            <MoreVertIcon />
                        </IconButton>

                        <Menu
                            id='options-menu'
                            anchorEl={menuAnchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                elevation: 3,
                                sx: {
                                    mt: 1,
                                    minWidth: 180,
                                    borderRadius: 2,
                                    overflow: 'visible',
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                        >
                            <MenuItem onClick={handleMenuClose} sx={{ gap: 1 }}>
                                <FileDownloadIcon fontSize='small' color='primary' />
                                <Typography variant='body2'>내보내기</Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleMenuClose} sx={{ gap: 1 }}>
                                <FeedbackIcon fontSize='small' color='primary' />
                                <Typography variant='body2'>피드백 보내기</Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleClearChat} sx={{ gap: 1 }}>
                                <DeleteIcon fontSize='small' color='error' />
                                <Typography variant='body2' color='error.main'>
                                    현재 대화 지우기
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Paper>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.5,
                            background: theme.palette.background.gradient,
                            pointerEvents: 'none',
                        }}
                    />

                    <Box
                        ref={scrollContainerRef}
                        sx={{
                            width: '100%',
                            maxWidth: '900px',
                            height: '100%',
                            overflowY: 'auto',
                            position: 'relative',
                            p: { xs: 2, sm: 3 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            scrollBehavior: 'smooth',
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: themeMode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: themeMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                '&:hover': {
                                    background: themeMode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                                },
                            },
                        }}
                    >
                        {messages.length === 0 && (
                            <Fade in={true} timeout={800}>
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        p: 3,
                                        mt: 6,
                                        opacity: 0.75,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            bgcolor: 'primary.main',
                                            mb: 2,
                                            boxShadow: 3,
                                        }}
                                    >
                                        <SmartToyIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <Typography variant='h6'>WIN_AI에게 무엇이든 물어보세요!</Typography>
                                    <Typography variant='body2' color='text.secondary' sx={{ maxWidth: '500px' }}>
                                        안녕하세요! 저는 WIN_AI 1.0입니다. 질문, 아이디어 공유, 정보 검색 등 무엇이든
                                        편하게 물어보세요. 최선을 다해 도와드리겠습니다.
                                    </Typography>
                                </Box>
                            </Fade>
                        )}

                        {messages.map((message, index) => (
                            <Zoom
                                in={true}
                                key={index}
                                style={{
                                    transformOrigin: message.role === 'user' ? 'right' : 'left',
                                    transitionDelay: `${50 * (index % 5)}ms`,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                        alignItems: 'flex-end',
                                        gap: 1.5,
                                        position: 'relative',
                                    }}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                bgcolor: themeMode === 'light' ? 'secondary.main' : 'secondary.dark',
                                                boxShadow: 2,
                                                mb: 0.5,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                        >
                                            <SmartToyIcon fontSize='small' />
                                        </Avatar>
                                    )}

                                    <Paper
                                        elevation={2}
                                        sx={{
                                            maxWidth: { xs: '80%', sm: '70%', md: '60%' },
                                            p: '12px 16px',
                                            position: 'relative',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                            background:
                                                message.role === 'user'
                                                    ? theme.palette.background.messageUser
                                                    : theme.palette.background.messageBot,
                                            color: message.role === 'user' ? '#ffffff' : theme.palette.text.primary,
                                            borderRadius:
                                                message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            boxShadow:
                                                message.role === 'user'
                                                    ? '0 2px 8px rgba(0,0,0,0.15)'
                                                    : '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                boxShadow:
                                                    message.role === 'user'
                                                        ? '0 4px 12px rgba(0,0,0,0.2)'
                                                        : '0 4px 12px rgba(0,0,0,0.1)',
                                            },
                                            opacity: message.content === '...' ? 0.7 : 1,
                                            fontStyle: message.content === '...' ? 'italic' : 'normal',
                                            animation:
                                                message.content === '...' ? 'pulse 1.5s infinite ease-in-out' : 'none',
                                            '@keyframes pulse': {
                                                '0%': { opacity: 0.7 },
                                                '50%': { opacity: 0.4 },
                                                '100%': { opacity: 0.7 },
                                            },
                                        }}
                                    >
                                        {message.content}

                                        <Typography
                                            variant='caption'
                                            sx={{
                                                display: 'block',
                                                textAlign: message.role === 'user' ? 'right' : 'left',
                                                mt: 0.5,
                                                opacity: 0.7,
                                                fontSize: '0.65rem',
                                                color:
                                                    message.role === 'user'
                                                        ? 'rgba(255,255,255,0.8)'
                                                        : 'text.secondary',
                                            }}
                                        >
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Paper>

                                    {message.role === 'user' && (
                                        <Avatar
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                bgcolor: 'primary.main',
                                                boxShadow: 2,
                                                mb: 0.5,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                        >
                                            <AccountCircleIcon fontSize='small' />
                                        </Avatar>
                                    )}
                                </Box>
                            </Zoom>
                        ))}
                    </Box>
                </Box>
                <Fade in={!!error} timeout={300}>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            bottom: 80,
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '600px',
                            zIndex: 1050,
                        }}
                    >
                        {error && (
                            <Alert
                                severity='error'
                                variant='filled'
                                onClose={() => setError(null)}
                                sx={{
                                    boxShadow: 3,
                                    borderRadius: 2,
                                }}
                            >
                                {error}
                            </Alert>
                        )}
                    </Box>
                </Fade>
                <Paper
                    elevation={3}
                    square
                    sx={{
                        p: { xs: '12px', sm: '16px 24px' },
                        borderTop: 1,
                        borderColor: 'divider',
                        background:
                            themeMode === 'light'
                                ? 'linear-gradient(0deg, #ffffff 0%, #fafafa 100%)'
                                : 'linear-gradient(0deg, #1e1e1e 0%, #272727 100%)',
                        position: 'relative',
                        zIndex: 1000,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxWidth: '800px',
                            mx: 'auto',
                        }}
                    >
                        <TextField
                            fullWidth
                            variant='outlined'
                            size='small'
                            placeholder='메시지를 입력하세요...'
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyPress}
                            disabled={loading}
                            multiline
                            maxRows={4}
                            InputProps={{
                                sx: {
                                    borderRadius: '24px',
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    backdropFilter: 'blur(4px)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                                    '&:hover': {
                                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)',
                                    },
                                    '&.Mui-focused': {
                                        boxShadow:
                                            themeMode === 'light'
                                                ? '0 0 0 2px rgba(63, 81, 181, 0.2)'
                                                : '0 0 0 2px rgba(121, 134, 203, 0.2)',
                                    },
                                },
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            color='primary'
                                            onClick={sendMessage}
                                            disabled={loading || !input.trim()}
                                            edge='end'
                                            sx={{
                                                mr: 0.5,
                                                transition: 'transform 0.2s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                },
                                                '&:active': {
                                                    transform: 'scale(0.95)',
                                                },
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} color='inherit' />
                                            ) : (
                                                <SendIcon sx={{ transform: 'rotate(-20deg)' }} />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Paper>
                <Box
                    sx={{
                        py: 0.5,
                        px: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                    }}
                >
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                        WIN_AI 1.0 • Powered by Ollama
                    </Typography>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                action={
                    <IconButton size='small' aria-label='close' color='inherit' onClick={handleSnackbarClose}>
                        <CloseIcon fontSize='small' />
                    </IconButton>
                }
            />
        </ThemeProvider>
    );
}

export default OllamaChatPage;
