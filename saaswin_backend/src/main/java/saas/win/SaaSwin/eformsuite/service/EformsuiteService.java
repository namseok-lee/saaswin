package saas.win.SaaSwin.eformsuite.service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.jodconverter.LocalConverter;
import org.jodconverter.office.LocalOfficeManager;
import org.jodconverter.office.OfficeException;
import org.jodconverter.office.OfficeManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.util.SswMultipartFile;

import java.io.*;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class EformsuiteService {

    private final SqlService sqlService;

    @Value("${image.efs.temp.folder}")
    private String tempFolder;

    @Value("${image.efs.libreoffice}")
    private String libre;

    @Value("${file.server.api}")
    private String fileserver;

    @Value("${file.server.insert}")
    private String fileins;

    @Value("${file.server.down}")
    private String filedown;

    @Value("${image.efs.pdf.ins}")
    private String pdfpath;

    /**
     * sql 호출 조회
     */
    @Transactional
    public SswResponseDTO templateInsert(Map<String, Object> params) {

        // template 정보 insert

        return null;
    }

    /**
     * 파일변환
     * 1. 파일을 임시 경로에 저장
     * 2. 파일을 pdf로 변환 (pdf면 pdf 그대로 사용)
     * 3. fileserver로 전송
     * 4. fileid return
     */
    public String fileInsert(MultipartFile file, Map<String, Object> params) throws ParseException, SQLException, IOException, InterruptedException, OfficeException {

        // 1. 파일을 임시 경로에 저장하고, 해당 경로를 사용하여 PDF 변환
        String tempFilePath = tempFolder + file.getOriginalFilename();
        file.transferTo(new java.io.File(tempFilePath));

        // 2. 파일을 pdf로 변환 (pdf면 pdf 그대로 사용)
        String tempPdfFilePath = "";
        byte[] pdfData = null;
        String fileExtension = tempFilePath.substring(tempFilePath.lastIndexOf('.') + 1).toLowerCase();

        log.info("tempFolder : " + tempFolder);
        log.info("file.getOriginalFilename() : " + file.getOriginalFilename());
        log.info("tempFilePath : " + tempFilePath);

        switch (fileExtension) {
            case "pdf":
                File tfile = new File(tempFilePath);
                try (FileInputStream fis = new FileInputStream(tfile);
                     ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[1024];
                    int length;
                    while ((length = fis.read(buffer)) != -1) {
                        baos.write(buffer, 0, length);
                    }
                    pdfData = baos.toByteArray();  // PDF 파일을 byte[]로 반환
                }
                tempPdfFilePath = tempFilePath;
                break;
            case "docx":
            case "doc":
                tempPdfFilePath = convertToPdf(tempFilePath);
                break;
            case "xls":
            case "xlsx":
                tempPdfFilePath = convertToPdf(tempFilePath);
                break;
            case "ppt":
            case "pptx":
                tempPdfFilePath = convertToPdf(tempFilePath);
                break;
            case "hwp":
            case "hwpx":
                tempPdfFilePath = convertToPdf(tempFilePath);
                break;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                tempPdfFilePath = convertToPdf(tempFilePath);
                break;
            default:
                throw new UnsupportedOperationException("Unsupported file type: " + fileExtension);
        }

        // 변환실패
        if("".equals(tempPdfFilePath)) {
            File t1file = new File(tempFilePath);
            if(t1file.exists()) {
                t1file.delete();
            }
            return null;
        }

        log.info("tempPdfFilePath : " + tempPdfFilePath);

        // 3. fileserver로 전송
        // pdf로 변환된 파일을 multipartFile로 만들어서 fileserver api 호출
        // MultipartFile로 변환
        File tempPdfFile = new File(tempPdfFilePath);
        FileItem fileItem = new DiskFileItem("file", "application/octet-stream", false, tempPdfFile.getName(), (int) tempPdfFile.length(), tempPdfFile.getParentFile());
        fileItem.getOutputStream().write(java.nio.file.Files.readAllBytes(tempPdfFile.toPath()));

        log.info("tempPdfFile : " + tempPdfFile);

        //MultipartFile multipartFile = new CommonsMultipartFile(fileItem);
        MultipartFile multipartFile = null;
        //params.put("user_no", "");
        params.put("proc_nm", pdfpath);

        // RestTemplate을 사용하여 API 호출
        RestTemplate restTemplate = new RestTemplate();

        // API URL 설정
        String url = fileserver + fileins;

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 요청 본문 설정
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        MultipartFile multipartFile1 = new SswMultipartFile(tempPdfFile);

        log.info("pdfpath : " + pdfpath);
        log.info("tempPdfFile : " + tempPdfFile.getName());
        log.info("multipartFile1.getName() : " + multipartFile1.getName());
        log.info("multipartFile1.getOriginalFilename() : " + multipartFile1.getOriginalFilename());

        body.add("file", multipartFile1.getResource() );
        body.add("params", params);

        // HttpEntity 설정
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        //url = "http://localhost:9001/api/file/fileInsert";
        // 파일을 전송하는 POST 요청
        ResponseEntity<SswResponseDTO> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, SswResponseDTO.class);

        // 임시 경로에 있던 pdf를 삭제
        File t1file = new File(tempFilePath);
        if(t1file.exists()) {
            t1file.delete();
        }
        File t2file = new File(tempPdfFilePath);
        if(t2file.exists()) {
            t2file.delete();
        }

        // 실패
        if(!response.getStatusCode().is2xxSuccessful()) {
            return null;
        }
        if (!SswConstants.RESULT_CODE_SUCCESS.equals(response.getBody().getRtnCode())) {
            return null;
        }

        // 4. fileid return
        String fileId = "";
        for(SswResponseDataDTO res : response.getBody().getResData()) {
            for(Map<String, Object> map : res.getData()) {
                //String return_cd = String.valueOf(((Map)((List)((Map) ((Map) map.get("data")).get("data")).get("data")).get(0)).get("return_cd"));
                String file_id = String.valueOf(((Map)((Map)((Map)map.get("data")).get("data")).get("data")).get("file_id"));
                // 실패
                if("90000".equals(file_id)) {
                    return null;
                }
                else {
                    fileId = file_id;
                }
            }
        }
        log.info("eformsuite upload fileId : " + fileId);

        return fileId;
    }

    /**
     * 템플릿 복사
     * 1. tmplt_id 배열로 템플릿 조회
     * 2. 각 템플릿의 file_id와 thumbnail_file_id를 복사
     * 3. 새 템플릿 ID 생성 및 복사본 저장
     */
    @Transactional
    public SswResponseDTO templateCopy(Map<String, Object> params) {
        SswResponseDTO response = new SswResponseDTO();
        List<SswResponseDataDTO> resultList = new ArrayList<>();
        
        try {
            // 1. 파라미터 확인
            List<String> tmpltIds = (List<String>) params.get("tmplt_ids");
            String workUserId = (String) params.get("work_user_id");
            
            if (tmpltIds == null || tmpltIds.isEmpty() || workUserId == null) {
                throw new IllegalArgumentException("필수 파라미터가 누락되었습니다.");
            }
            
            log.info("템플릿 복사 요청: {}", tmpltIds);
            
            // 2. 각 템플릿 ID에 대해 복사 작업 수행
            for (String tmpltId : tmpltIds) {
                // 2.1 템플릿 조회
                List<Map<String, Object>> queryParams = new ArrayList<>();
                Map<String, Object> queryParam = new HashMap<>();
                queryParam.put("tmplt_id", tmpltId);
                queryParams.add(queryParam);
                
                SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
                sqlDto.setSqlId("hrs_sqlgen01"); // SQL ID 설정 - hrs_fileserver01 사용
                sqlDto.setSql_key("hrs_sqlgen_select"); // SQL 키 설정
                sqlDto.setParams(queryParams);
                
                List<Map<String, Object>> templateResults = sqlService.executeQuery_select_for_func(sqlDto);
                
                if (templateResults.isEmpty() || templateResults.get(0).get("data") == null) {
                    log.warn("템플릿을 찾을 수 없습니다: {}", tmpltId);
                    continue;
                }
                
                // 데이터 추출 구조: templateResults[0].data.data[0]
                Map<String, Object> dataMap = (Map<String, Object>) templateResults.get(0).get("data");
                List<Map<String, Object>> templateData = (List<Map<String, Object>>) dataMap.get("data");
                
                if (templateData == null || templateData.isEmpty()) {
                    log.warn("템플릿 데이터가 비어있습니다: {}", tmpltId);
                    continue;
                }
                
                Map<String, Object> template = templateData.get(0);
                
                // 템플릿 정보 추출
                String fileId = (String) template.get("file_id");
                String thumbnailFileId = (String) template.get("thumbnail_file_id");
                String rprsOgnzNo = (String) template.get("rprs_ognz_no");
                String taskClsfCd = (String) template.get("task_clsf_cd");
                String docKndCd = (String) template.get("doc_knd_cd");
                String tmpltTit = (String) template.get("tmplt_tit");
                String scrNo = (String) template.get("scr_no");
                Object componentInfo = template.get("component_info");
                
                // 2.2 파일 ID 복사 (file_id)
                String newFileId = null;
                if (fileId != null && !fileId.isEmpty()) {
                    // 파일 복사 API 호출 위한 파라미터 구성
                    List<Map<String, Object>> fileCopyParams = new ArrayList<>();
                    Map<String, Object> fileCopyParam = new HashMap<>();
                    fileCopyParam.put("file_id", fileId);
                    fileCopyParam.put("user_no", workUserId);
                    fileCopyParam.put(SqlConstants.REDIS_SQL_KEY, "FILE_COPY"); // Redis 키 설정
                    fileCopyParams.add(fileCopyParam);
                    
                    SswRequestSqlDTO fileCopySqlDto = new SswRequestSqlDTO();
                    fileCopySqlDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01); // hrs_fileserver01
                    fileCopySqlDto.setSql_key("FILE_COPY");
                    fileCopySqlDto.setParams(fileCopyParams);
                    
                    List<Map<String, Object>> fileCopyResults = sqlService.executeQuery_select_for_func(fileCopySqlDto);
                    
                    if (!fileCopyResults.isEmpty() && fileCopyResults.get(0).get("data") != null) {
                        Map<String, Object> fileCopyDataMap = (Map<String, Object>) fileCopyResults.get(0).get("data");
                        List<Map<String, Object>> fileCopyData = (List<Map<String, Object>>) fileCopyDataMap.get("data");
                        
                        if (fileCopyData != null && !fileCopyData.isEmpty()) {
                            Map<String, Object> fileResult = fileCopyData.get(0);
                            if (fileResult.containsKey("return_cd")) {
                                newFileId = (String) fileResult.get("return_cd");
                                log.info("파일 복사 성공: {} -> {}", fileId, newFileId);
                            }
                        }
                    }
                }
                
                // 2.3 썸네일 파일 ID 복사 (thumbnail_file_id)
                String newThumbnailFileId = null;
                if (thumbnailFileId != null && !thumbnailFileId.isEmpty()) {
                    // 썸네일 파일 복사 API 호출 위한 파라미터 구성
                    List<Map<String, Object>> thumbnailCopyParams = new ArrayList<>();
                    Map<String, Object> thumbnailCopyParam = new HashMap<>();
                    thumbnailCopyParam.put("file_id", thumbnailFileId);
                    thumbnailCopyParam.put("user_no", workUserId);
                    thumbnailCopyParam.put(SqlConstants.REDIS_SQL_KEY, "FILE_COPY"); // Redis 키 설정
                    thumbnailCopyParams.add(thumbnailCopyParam);
                    
                    SswRequestSqlDTO thumbnailCopySqlDto = new SswRequestSqlDTO();
                    thumbnailCopySqlDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01); // hrs_fileserver01
                    thumbnailCopySqlDto.setSql_key("FILE_COPY");
                    thumbnailCopySqlDto.setParams(thumbnailCopyParams);
                    
                    List<Map<String, Object>> thumbnailCopyResults = sqlService.executeQuery_select_for_func(thumbnailCopySqlDto);
                    
                    if (!thumbnailCopyResults.isEmpty() && thumbnailCopyResults.get(0).get("data") != null) {
                        Map<String, Object> thumbnailCopyDataMap = (Map<String, Object>) thumbnailCopyResults.get(0).get("data");
                        List<Map<String, Object>> thumbnailCopyData = (List<Map<String, Object>>) thumbnailCopyDataMap.get("data");
                        
                        if (thumbnailCopyData != null && !thumbnailCopyData.isEmpty()) {
                            Map<String, Object> thumbnailResult = thumbnailCopyData.get(0);
                            if (thumbnailResult.containsKey("return_cd")) {
                                newThumbnailFileId = (String) thumbnailResult.get("return_cd");
                                log.info("썸네일 파일 복사 성공: {} -> {}", thumbnailFileId, newThumbnailFileId);
                            }
                        }
                    }
                }
                
                // 2.4 새 템플릿 ID 생성
                String newTemplateId = UUID.randomUUID().toString();
                
                // 2.5 템플릿 복사본 저장
                List<Map<String, Object>> insertParams = new ArrayList<>();
                Map<String, Object> insertParam = new HashMap<>();
                
                // 복사한 템플릿 정보 설정
                insertParam.put("action_type", "I"); // Insert
                insertParam.put("tmplt_id", newTemplateId);
                insertParam.put("rprs_ognz_no", rprsOgnzNo);
                insertParam.put("task_clsf_cd", taskClsfCd);
                insertParam.put("doc_knd_cd", docKndCd);
                insertParam.put("tmplt_tit", tmpltTit + " (복사)");
                insertParam.put("tmplt_reg_dt", getCurrentTimestamp());
                insertParam.put("component_info", componentInfo);
                insertParam.put("scr_no", scrNo);
                insertParam.put("del_yn", "N");
                insertParam.put("work_user_no", workUserId);
                insertParam.put(SqlConstants.REDIS_SQL_KEY, "EFS_TEMPLATE_INSERT"); // Redis 키 설정
                
                // 새 파일 ID와 썸네일 파일 ID 설정
                insertParam.put("file_id", newFileId != null ? newFileId : fileId);
                insertParam.put("thumbnail_file_id", newThumbnailFileId != null ? newThumbnailFileId : thumbnailFileId);
                
                insertParams.add(insertParam);
                
                // 템플릿 저장 SQL 실행
                SswRequestSqlDTO insertSqlDto = new SswRequestSqlDTO();
                insertSqlDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01); // hrs_fileserver01
                insertSqlDto.setSql_key("EFS_TEMPLATE_INSERT");
                insertSqlDto.setParams(insertParams);
                
                List<Map<String, Object>> insertResults = sqlService.executeQuery_select_for_func(insertSqlDto);
                
                // 2.6 sys_col_info 테이블 데이터 복사
                List<Map<String, Object>> sysColParams = new ArrayList<>();
                Map<String, Object> sysColParam = new HashMap<>();
                sysColParam.put("src_tmplt_id", tmpltId);
                sysColParam.put("new_tmplt_id", newTemplateId);
                sysColParam.put("work_user_no", workUserId);
                sysColParam.put(SqlConstants.REDIS_SQL_KEY, "EFS_SYS_COL_COPY"); // Redis 키 설정
                sysColParams.add(sysColParam);
                
                SswRequestSqlDTO sysColSqlDto = new SswRequestSqlDTO();
                sysColSqlDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01); // hrs_fileserver01
                sysColSqlDto.setSql_key("EFS_SYS_COL_COPY");
                sysColSqlDto.setParams(sysColParams);
                
                List<Map<String, Object>> sysColResults = sqlService.executeQuery_select_for_func(sysColSqlDto);
                
                // 2.7 결과 데이터 추가
                SswResponseDataDTO resData = new SswResponseDataDTO();
                resData.setData(insertResults);
                resData.setSqlId(0);
                resultList.add(resData);
                
                log.info("템플릿 복사 완료: {} -> {}", tmpltId, newTemplateId);
            }
            
            // 3. 응답 생성
            response.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
            response.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
            response.setResData(resultList);
            
        } catch (Exception e) {
            log.error("템플릿 복사 중 오류 발생", e);
            response.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            response.setRtnMsg("템플릿 복사 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 현재 타임스탬프를 YYYYMMDDHHmmss 형식으로 반환
     */
    private String getCurrentTimestamp() {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        return sdf.format(new java.util.Date());
    }

    private String convertToPdf(String filePath) throws IOException, InterruptedException, OfficeException {

        // 변환할 파일
        String fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
        String outFilePath = filePath.replace(fileExtension, "pdf");

        // LibreOffice 설치 경로 설정
        File libreOfficeHome = new File(libre);

        // OfficeManager 설정
        OfficeManager officeManager = LocalOfficeManager.builder()
                .officeHome(libreOfficeHome)  // LibreOffice 설치 경로 지정
                .build();

        try {
            officeManager.start();

            File inputFile = new File(filePath); // 입력 파일 경로
            File outputFile = new File(outFilePath); // 출력 파일 경로

            // LocalConverter의 인스턴스를 생성하여 변환 처리
            LocalConverter.builder()
                    .officeManager(officeManager)
                    .build()
                    .convert(inputFile)
                    .to(outputFile)
                    .execute();

            // 변환 성공 여부 확인
            if (outputFile.exists()) {
                log.debug("파일 변환 성공: " + outFilePath);
            } else {
                log.error("파일 변환 실패: " + outFilePath);
                outFilePath = "";
            }

        }
        catch (OfficeException oex) {
            log.error("error 파일 변환 실패: ", oex);
            outFilePath = "";
        }
        finally {
            officeManager.stop();
        }

        return outFilePath;

    }

    // 이미지 파일 (.jpg, .png, .jpeg, .gif) -> PDF로 변환
    public byte[] convertImageToPdf(String filePath) throws IOException {
        // PDF Writer 객체 생성
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);

        // PdfDocument 객체 생성
        PdfDocument pdfDoc = new PdfDocument(writer);

        // Document 객체 생성
        Document document = new Document(pdfDoc);

        // 이미지 파일을 PDF로 변환
        Image image = new Image(ImageDataFactory.create(filePath));
        document.add(image);

        // PDF 닫기
        document.close();

        // PDF를 byte array로 변환하여 반환
        return baos.toByteArray();

    }

}
