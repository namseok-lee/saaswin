import { CircularProgress } from '@mui/material';
import Button from 'components/Button';
import SwModal from 'components/Modal';
import Toast from 'components/Toast';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { IcoFile, IcoTrash, IcoUpload } from '@/assets/Icon';
import styles from '../../styles/pages/Demo/page.module.scss';

const ModalEx = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [open2, setOpen2] = useState(false);
    const handleOpen2 = () => setOpen2(true);
    const handleClose2 = () => setOpen2(false);
    const [open3, setOpen3] = useState(false);
    const handleOpen3 = () => setOpen3(true);
    const handleClose3 = () => setOpen3(false);
    const [open4, setOpen4] = useState(false);
    const handleOpen4 = () => setOpen4(true);
    const handleClose4 = () => setOpen4(false);
    const [open5, setOpen5] = useState(false);
    const handleOpen5 = () => setOpen5(true);
    const handleClose5 = () => setOpen5(false);

    const [files, setFiles] = useState<File[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const fileTypes = ['xls', 'xlsx'];
    const handleChange = (selectedFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
        setErrorMsg('');
    };
    const handleTypeError = () => {
        setErrorMsg('붉은 셀은 자료에서 데이터를 읽어오지 못한 영역입니다. 직접 수정해주세요.');
    };

    const handleRemoveFile = (fileName: string) => {
        setFiles(files.filter((file) => file.name !== fileName));
    };

    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Alert(Basic)</div>
            <div className={`${styles.col} ${styles.title}`}>Alert(button Text)</div>
            <div className={`${styles.col} ${styles.title}`}>Excel upload</div>
            <div className={`${styles.col} ${styles.title}`}>Toast(Confirm)</div>
            <div className={`${styles.col} ${styles.title}`}></div>

            <div className={styles.col}></div>
            <div className={styles.col}>
                <Button id='test1' type='primary' size='lg' onClick={handleOpen}>
                    Alert
                </Button>
                <SwModal open={open} onClose={handleClose} title='Popup Title'>
                    <div className='msg'>내용을 입력하세요</div>
                    <div className='actions'>
                        <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon'>
                            취소
                        </Button>
                        <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon'>
                            적용
                        </Button>
                    </div>
                </SwModal>
            </div>
            <div className={styles.col}>
                <Button id='test1' type='primary' size='lg' onClick={handleOpen2}>
                    Alert
                </Button>
                <SwModal open={open2} onClose={handleClose2} title='Popup Title' txtBtn1='txtBtn1' txtBtn2='txtBtn2'>
                    <div className='msg'>버튼 텍스트 변경</div>
                    <div className='actions'>
                        <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon'>
                            취소
                        </Button>
                        <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon'>
                            확인
                        </Button>
                    </div>
                </SwModal>
            </div>
            <div className={styles.col}>
                <Button id='test1' type='primary' size='lg' onClick={handleOpen3}>
                    Alert
                </Button>
                <SwModal
                    open={open3}
                    onClose={handleClose3}
                    size='xl'
                    title='엑셀 업로드'
                    txtBtn1='취소'
                    txtBtn2='적용'
                    maxWidth='900px'
                >
                    <div className='dragNdropFile'>
                        <FileUploader
                            handleChange={handleChange}
                            name='files'
                            types={fileTypes}
                            classes='dropArea'
                            onTypeError={handleTypeError}
                            hoverTitle='' // "Drop Here" 문구를 없애기 위해 빈 문자열
                            dropMessageStyle={{ display: 'none' }} // 메시지 자체를 표시하지 않음
                            multiple={true}
                        >
                            {loading ? (
                                <CircularProgress size={120} />
                            ) : files.length > 0 ? (
                                <div className='fileList'>
                                    <div className='title'>엑셀 자료 업로드</div>
                                    <ul className='list'>
                                        {files.map((file, index) => (
                                            <li key={index} className='item'>
                                                <IcoFile fill='#7C7C7C' />
                                                {file.name}
                                                <Button
                                                    id=''
                                                    onClick={() => handleRemoveFile(file.name)}
                                                    className='btnDelete'
                                                >
                                                    <IcoTrash fill='#666' />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className='fileDrop'>
                                    <IcoUpload />
                                    <p className='guideText'>
                                        여기를 클릭 해 파일을 업로드 하거나, <br />
                                        파일을 여기로 드래그하세요.(.xlsx, .xls)
                                    </p>
                                </div>
                            )}
                        </FileUploader>
                        <div className='desc'>
                            <div className='title'>미리보기</div>
                            <p className='text'>
                                업로드 된 자료를 적용 전 확인합니다.
                                <br />
                                데이터를 적용할 경우, <span className='emphasis'>기존 데이터가 덮어씌워집니다.</span>
                            </p>
                            {errorMsg && <p className='errorMsg'>{errorMsg}</p>}
                        </div>
                        <div className='preview'>
                            <div className='beforeText'>자료를 업로드 한 후 확인하실 수 있습니다.</div>
                        </div>
                    </div>
                    <div className='actions'>
                        <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon'>
                            취소
                        </Button>
                        <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon'>
                            적용
                        </Button>
                    </div>
                </SwModal>
            </div>
            <div className={styles.col}>
                <Button id='test1' type='primary' size='lg' onClick={handleOpen4}>
                    Alert
                </Button>
                <Toast open={open4} message='Message' onClose={handleClose4} />
                &nbsp;
                <Button id='test1' type='primary' size='lg' onClick={handleOpen5}>
                    Alert
                </Button>
                <Toast open={open5} message='Message' type='error' onClose={handleClose5} />
            </div>
        </>
    );
};

export default ModalEx;
