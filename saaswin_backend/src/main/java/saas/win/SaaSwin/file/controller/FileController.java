package saas.win.SaaSwin.file.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.batik.gvt.CompositeGraphicsNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.file.dto.FileResponseDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestObjectDTO;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseObjectDTO;
import saas.win.SaaSwin.ssw.service.SswService;
import saas.win.SaaSwin.util.SswUtils;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class FileController {

    @Value("${image.emp.folder}")
    private String imageEmpFolder;
    // /home/win/tomcat/images

    @Value("${image.noimage}")
    private String noimage;

    private final SqlService sqlService;

    @Operation(summary = "이미지 조회", description = "이미지 뷰 - 디렉토리 직접 접근(GET)")
    @GetMapping("/api/file/imgView/{typeCd}/{fileId}")
    public ResponseEntity<Resource> imgView(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @PathVariable String typeCd,
            @PathVariable String fileId
    ) throws IOException {

        try {
            // fileId 기본 검증
            if (org.apache.commons.lang3.StringUtils.isBlank(fileId) || "temp".equals(fileId)) {
                throw new IOException("temp");
            }
            // 디렉토리 탈출 방지(필요시 규칙 더 추가)
            if (!fileId.matches("^[a-zA-Z0-9\\-]+$")) {
                return ResponseEntity.badRequest().build();
            }

            // proc 추출: "_" 이전
            String proc = typeCd.contains("_") ? typeCd.substring(0, typeCd.indexOf("_")) : typeCd;

            // /home/win/insait_files/{rprsOgnzNo}/{proc}/{typeCd}/{fileId}.zip
            String baseDir = Paths.get(imageEmpFolder, rprsOgnzNo, proc, typeCd).toString();
            String zipFilePath = Paths.get(baseDir, fileId + ".zip").toString();

            Path zipLocation = Paths.get(zipFilePath);
            log.debug("ZIP file path: {}", zipFilePath);

            if (Files.exists(zipLocation) && Files.isReadable(zipLocation)) {
                Path extractedImagePath = extractFileFromZip(zipLocation, baseDir);

                if (extractedImagePath != null) {
                    return buildImageResponse(extractedImagePath);
                } else {
                    return buildNoImageResponse();
                }
            } else {
                return buildNoImageResponse();
            }

        } catch (IOException e) {
            if (!"temp".equals(e.getMessage())) {
                log.error("Error extracting or reading ZIP file", e);
            }
            return buildNoImageResponse();
        }
    }

    // 공통 응답 헬퍼
    private ResponseEntity<Resource> buildImageResponse(Path imagePath) throws IOException {
        Resource resource = new UrlResource(imagePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String contentType = Files.probeContentType(imagePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imagePath.getFileName() + "\"")
                // 선택: 캐시 헤더
                //.header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }

    private ResponseEntity<Resource> buildNoImageResponse() throws IOException {
        Path imagePath = Paths.get(noimage).normalize();
        if (!Files.exists(imagePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return buildImageResponse(imagePath);
    }


    @Operation(summary = "파일 다운로드", description = "파일 다운로드")
    @Description("파일 다운로드")
    @GetMapping("/api/file/fileDownload/{fileId}")
    public ResponseEntity<InputStreamResource> fileDownload(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @PathVariable String fileId) throws ParseException {
        try {
            // 1. 파일id로 이미지경로+이름 가져옴
            String rprs_ognz_no = "";
            String tempFolderPath = "";
            String filePathNm = "";
            String fileOriginNm = "";
            List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
            Map<String, Object> param = new HashMap<String, Object>();
            param.put("file_id", fileId);
            param.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_FILE_KEY_03);
            params.add(param);

            SswRequestSqlDTO paramDto = new SswRequestSqlDTO();
//            paramDto.setSqlId(SqlConstants.R_FILE_SQL_ID_01);
            paramDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01);
            paramDto.setParams(params);
            List<Map<String, Object>> fileResult = sqlService.executeQuery_select_for_func(paramDto);
            List<Map<String, Object>> fileResultMap = ((List)((Map)fileResult.get(0).get("data")).get("data"));

            if (fileResultMap.size() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();  // 파일이 없으면 404 응답
            }

            for (Map<String, Object> file : fileResultMap) {
                filePathNm = String.valueOf(file.get("path_nm")) + String.valueOf(file.get("encpt_nm")) + ".zip";
                fileOriginNm = String.valueOf(file.get("orgnfl_nm")) + "." + String.valueOf(file.get("orgnfl_extn_nm"));
                fileOriginNm = URLEncoder.encode(fileOriginNm, StandardCharsets.UTF_8.toString());
                rprs_ognz_no = String.valueOf(file.get("path_nm")).substring(0,4);
                tempFolderPath = imageEmpFolder + rprs_ognz_no + "/" + String.valueOf(file.get("encpt_nm"));
            }

            // 2. ZIP 파일 경로
            String zipFilePath = imageEmpFolder + filePathNm;
            Path zipLocation = Paths.get(zipFilePath);
            log.debug("ZIP file path: " + zipFilePath);

            // ZIP 파일이 존재하고 읽을 수 있으면 압축 해제
            if (Files.exists(zipLocation) && Files.isReadable(zipLocation)) {
                // 임시 폴더를 생성하여 ZIP 파일을 압축 해제
                //Path tempDir = Files.createTempDirectory(imageEmpFolder + "/temp");

                // 3. 지정된 경로에 ZIP 파일을 압축 해제 (tempDir 경로 대신 직접 지정)
                Path extractedFilePath = extractFileFromZip(zipLocation, tempFolderPath);

                // 파일이 존재하면 다운로드
                if (extractedFilePath != null) {
                    // 파일 스트림 생성
                    InputStream fileStream = new FileInputStream(extractedFilePath.toFile());

                    // 파일 다운로드 메타데이터 설정
                    HttpHeaders headers = new HttpHeaders();
                    headers.add("Content-Disposition", "attachment; filename=" + fileOriginNm);
                    // headers.add("Content-Type", MediaType.APPLICATION_OCTET_STREAM_VALUE);
                    headers.add("Content-Type", MediaType.APPLICATION_PDF_VALUE);

                    // 다운로드 스트림 반환
                    return ResponseEntity.ok()
                            .headers(headers)
                            .contentLength(Files.size(extractedFilePath))
                            .body(new InputStreamResource(fileStream));
                } else {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();  // 파일이 없으면 404 응답
                }
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();  // ZIP 파일이 없으면 404 응답
            }

        } catch (IOException e) {
            log.error("Error extracting or reading ZIP file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

      /**
     * HTML 파일 내용 조회 (POST 방식)
     * 
     * @param request 파일 경로가 포함된 요청 객체
     * @return HTML 파일 내용 또는 오류 메시지
     */
    @Operation(summary = "HTML 파일 내용 조회", description = "파일 서버에서 HTML 파일 내용 조회")
    @PostMapping("/api/file/loadHtmlContent")
    public ResponseEntity<?> loadHtmlContent(@RequestBody Map<String, String> request) {
        try {
            String filePath = request.get("filePath"); // "path" → "filePath"로 수정
            
            if (filePath == null || filePath.trim().isEmpty()) {
                log.warn("❌ 파일 경로가 제공되지 않음");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "파일 경로가 필요합니다"));
            }

            log.info(" HTML 파일 로드 요청 - 파일 경로: {}", filePath);

            // 1. 파일 경로로 파일 정보 조회 (DB에서 먼저 확인)
            List<Map<String, Object>> params = new ArrayList<>();
            Map<String, Object> param = new HashMap<>();
            param.put("file_path", filePath);
            param.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_FILE_KEY_01);
            params.add(param);

            SswRequestSqlDTO paramDto = new SswRequestSqlDTO();
            paramDto.setSqlId(SqlConstants.R_FILE_SQL_ID_01);
            paramDto.setParams(params);
            List<Map<String, Object>> fileResult = sqlService.executeQuery_select(paramDto);
            List<Map<String, Object>> fileResultMap = ((List)((Map)fileResult.get(0).get("data")).get("data"));

            if (fileResultMap.size() == 0) {
                log.warn("❌ 파일을 찾을 수 없음 - 파일 경로: {}", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "파일을 찾을 수 없습니다: " + filePath));
            }

            // 2. 파일 서버에서 HTML 콘텐츠 가져오기
            String fileServerUrl = imageEmpFolder + filePath;
            log.info(" 파일 서버 요청 URL: {}", fileServerUrl);

            RestTemplate restTemplate = new RestTemplate();
            
            try {
                ResponseEntity<String> fileServerResponse = restTemplate.getForEntity(fileServerUrl, String.class);
                
                if (fileServerResponse.getStatusCode().is2xxSuccessful()) {
                    String htmlContent = fileServerResponse.getBody();
                    
                    log.info("✅ HTML 파일 로드 성공 - 파일 경로: {} (크기: {} bytes)", 
                            filePath, htmlContent != null ? htmlContent.length() : 0);
                    
                    // 파일 정보와 HTML 콘텐츠를 함께 반환
                    Map<String, Object> result = new HashMap<>();
                    result.putAll((Map<String, Object>) fileResultMap.get(0)); // 파일 정보
                    result.put("htmlContent", htmlContent); // HTML 콘텐츠 추가
                    result.put("contentLength", htmlContent != null ? htmlContent.length() : 0);
                    
                    return ResponseEntity.ok()
                            .header("Access-Control-Allow-Origin", "*")
                            .body(result);
                } else {
                    log.warn("❌ 파일 서버 응답 오류 - 상태 코드: {}, 파일 경로: {}", 
                            fileServerResponse.getStatusCode(), filePath);
                    
                    // 파일 정보는 있지만 콘텐츠 로드 실패
                    Map<String, Object> result = new HashMap<>();
                    result.putAll((Map<String, Object>) fileResultMap.get(0));
                    result.put("error", "HTML 콘텐츠를 로드할 수 없습니다");
                    result.put("htmlContent", null);
                    
                    return ResponseEntity.status(fileServerResponse.getStatusCode()).body(result);
                }
                
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                    log.warn("❌ HTML 파일을 찾을 수 없음 - 파일 경로: {}", filePath);
                    
                    Map<String, Object> result = new HashMap<>();
                    result.putAll((Map<String, Object>) fileResultMap.get(0));
                    result.put("error", "HTML 파일을 찾을 수 없습니다: " + filePath);
                    result.put("htmlContent", null);
                    
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
                } else {
                    log.error("❌ 파일 서버 클라이언트 오류 - 상태 코드: {}, 파일 경로: {}", 
                            e.getStatusCode(), filePath, e);
                    
                    Map<String, Object> result = new HashMap<>();
                    result.putAll((Map<String, Object>) fileResultMap.get(0));
                    result.put("error", "파일 서버 오류: " + e.getMessage());
                    result.put("htmlContent", null);
                    
                    return ResponseEntity.status(e.getStatusCode()).body(result);
                }
            } catch (HttpServerErrorException e) {
                log.error("❌ 파일 서버 내부 오류 - 상태 코드: {}, 파일 경로: {}", 
                        e.getStatusCode(), filePath, e);
                
                Map<String, Object> result = new HashMap<>();
                result.putAll((Map<String, Object>) fileResultMap.get(0));
                result.put("error", "파일 서버 내부 오류가 발생했습니다");
                result.put("htmlContent", null);
                
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
            } catch (ResourceAccessException e) {
                log.error("❌ 파일 서버 연결 오류 - 파일 경로: {}", filePath, e);
                
                Map<String, Object> result = new HashMap<>();
                result.putAll((Map<String, Object>) fileResultMap.get(0));
                result.put("error", "파일 서버에 연결할 수 없습니다");
                result.put("htmlContent", null);
                
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(result);
            }

        } catch (Exception e) {
            log.error("❌ HTML 파일 경로 조회 중 예상치 못한 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    /**
     * HTML 파일 내용 조회 (GET 방식)
     * 
     * @param filePath 파일 경로 (경로 변수)
     * @return HTML 파일 내용 또는 오류 메시지
     */
    @Operation(summary = "HTML 파일 내용 조회 (GET)", description = "파일 경로를 URL 경로로 받아 HTML 파일 내용 조회")
    @GetMapping("/api/loadHtmlContent/{filePath:.+}")
    public ResponseEntity<?> loadHtmlContentByPath(@PathVariable String filePath) {
        try {
            if (filePath == null || filePath.trim().isEmpty()) {
                log.warn("❌ 파일 경로가 제공되지 않음");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "파일 경로가 필요합니다"));
            }

            log.info(" HTML 파일 로드 요청 (GET) - 파일 경로: {}", filePath);

            // 파일 서버 프록시 방식
            String fileServerUrl = "http://218.236.10.180:8080/WHNN/api/file/loadHtmlContent/" + filePath;
            log.info(" 파일 서버 요청 URL: {}", fileServerUrl);

            RestTemplate restTemplate = new RestTemplate();
            
            try {
                ResponseEntity<String> fileServerResponse = restTemplate.getForEntity(fileServerUrl, String.class);
                
                if (fileServerResponse.getStatusCode().is2xxSuccessful()) {
                    String htmlContent = fileServerResponse.getBody();
                    
                    log.info("✅ HTML 파일 로드 성공 (GET) - 파일 경로: {} (크기: {} bytes)", 
                            filePath, htmlContent != null ? htmlContent.length() : 0);
                    
                    return ResponseEntity.ok()
                            .contentType(MediaType.TEXT_HTML)
                            .header("Access-Control-Allow-Origin", "*")
                            .body(htmlContent);
                } else {
                    log.warn("❌ 파일 서버 응답 오류 (GET) - 상태 코드: {}", fileServerResponse.getStatusCode());
                    return ResponseEntity.status(fileServerResponse.getStatusCode())
                            .body(Map.of("error", "파일 서버에서 파일을 찾을 수 없습니다"));
                }
                
            } catch (Exception e) {
                log.error("❌ 파일 서버 연결 오류: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "파일 서버에 연결할 수 없습니다"));
            }

        } catch (Exception e) {
            log.error("❌ HTML 파일 로드 중 예상치 못한 오류 발생 (GET)", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 읽기 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * @param file
     * @param params - user_no , proc_nm(업무명)
     * @return
     * @throws ParseException
     */
    @Operation(summary = "파일 등록", description = "파일 등록")
    @Description("파일 등록")
    @PostMapping(value = "/api/file/fileInsert", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SswResponseDTO> fileInsert(
        @PathVariable("rprsOgnzNo") String rprsOgnzNo,
        @RequestPart(value = "file", required = false) MultipartFile file,
        @RequestPart(value = "params", required = false) Map<String, Object> params) throws ParseException {
        // 파일 및 파라미터 처리 로직 - 파일 등록 시 파일 정보를 디비에 저장하고, 파일을 압축하여 저장한다.
        try {
            String uploadPath = "";
            String rprsOgnzNo2 = "";
            String savePath = "";
            String userNo = String.valueOf(params.get("user_no"));
            // String processNm = String.valueOf(params.get("proc_nm"));
            String processNm = "";
            if (params != null) {
                Object procObj = params.get("proc_nm");
                if (procObj != null && !procObj.toString().trim().isEmpty()) {
                    processNm = procObj.toString().trim();
                }
            }
            String prefix = "";
            if (!processNm.isEmpty()) {
                int idx = processNm.indexOf('_');
                prefix = (idx != -1)
                    ? processNm.substring(0, idx)
                    : processNm;  // 언더스코어 없으면 전체를 prefix로
            }
            String fileNm = file.getOriginalFilename();
            //String fileEcnNm = UUID.randomUUID().toString() + "." + StringUtils.getFilenameExtension(fileNm);
            String fileEcnNm = UUID.randomUUID().toString() + ".zip";
            long fileSize = file.getSize() / 1024; // kbyte 단위

            // 0. 회사번호를 db에서 조회하고 업무는 파라미터로 받는다.
            // params에 rprs_ognz_no가 있는지 확인
            if (params.containsKey("rprs_ognz_no") && params.get("rprs_ognz_no") != null && !String.valueOf(params.get("rprs_ognz_no")).isEmpty()) {
                rprsOgnzNo2 = String.valueOf(params.get("rprs_ognz_no"));
                String basePath    = imageEmpFolder + "/" + rprsOgnzNo2;
                uploadPath = basePath
                + (prefix.isEmpty()    ? "" : "/" + prefix)
                + (processNm.isEmpty() ? "" : "/" + processNm);
                savePath    = "/" + rprsOgnzNo2
                    + (prefix.isEmpty()    ? "" : "/" + prefix)
                    + (processNm.isEmpty() ? "" : "/" + processNm);
            } else {
                // rprs_ognz_no가 없으면 DB에서 조회
                List<Map<String, Object>> sqlparams = new ArrayList<Map<String, Object>>();
                params.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_FILE_KEY_01);
                sqlparams.add(params);

                SswRequestSqlDTO paramDto = new SswRequestSqlDTO();
    //            paramDto.setSqlId(SqlConstants.R_FILE_SQL_ID_02);
                paramDto.setSqlId(SqlConstants.REDIS_SQL_SCR_01);
                paramDto.setParams(sqlparams);
                List<Map<String, Object>> userResult = sqlService.executeQuery_select_for_func(paramDto);
                List<Map<String, Object>> returnObjList = ((List)((Map)userResult.get(0).get("data")).get("data"));
                for(Map<String, Object> user : returnObjList) {
                    rprsOgnzNo2 = String.valueOf(user.get("rprs_ognz_no")); //String.valueOf(params.get("rprs_ognz_no"));
                    String basePath    = imageEmpFolder + "/" + rprsOgnzNo2;
                    uploadPath = basePath
                    + (prefix.isEmpty()    ? "" : "/" + prefix)
                    + (processNm.isEmpty() ? "" : "/" + processNm);
                    savePath    = "/" + rprsOgnzNo2
                        + (prefix.isEmpty()    ? "" : "/" + prefix)
                        + (processNm.isEmpty() ? "" : "/" + processNm);
                }
            }
            log.debug("uploadPath : " + uploadPath);

            // 폴더 생성 (존재하지 않을 경우)
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 1. 원본 파일 저장
    //            Path originalPath = Paths.get(uploadPath + "//" + fileNm);
    //            Files.createDirectories(originalPath.getParent()); // 디렉토리 없으면 생성
    //            Files.write(originalPath, file.getBytes());

            // 2. 파일명을 수정하여 저장 (UUID)
            //Path modifiedPath = Paths.get(uploadPath + "//" + fileEcnNm);
            //Files.write(modifiedPath, file.getBytes());

            // 1. ZIP 파일 생성 (파일명을 UUID로 변경하여 저장)
            Path zipFilePath = Paths.get(uploadPath + "//" + fileEcnNm);  // UUID.zip 파일로 저장
            try (FileOutputStream fos = new FileOutputStream(zipFilePath.toFile());
                ZipOutputStream zipOut = new ZipOutputStream(fos)) {

                // 2. ZIP 파일에 원본 파일을 압축하여 저장
                addFileToZip(file, zipOut);

            }

            // 3. db 저장
            List<Map<String, Object>> insparams = new ArrayList<Map<String, Object>>();
            Map<String, Object> insparam = new HashMap<String, Object>();
            insparam.put("orgnfl_nm", SswUtils.getFileNameWithoutExtension(fileNm));
            insparam.put("orgnfl_extn_nm", StringUtils.getFilenameExtension(fileNm));
            insparam.put("orgnfl_sz", fileSize);
            insparam.put("encpt_nm", SswUtils.getFileNameWithoutExtension(fileEcnNm));
            insparam.put("user_no", userNo);
            insparam.put("rprs_ognz_no", rprsOgnzNo2);
            insparam.put("path_nm", savePath + "/");
            insparam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_FILE_KEY_02);
            insparams.add(insparam);

            SswRequestSqlDTO insparamDto = new SswRequestSqlDTO();
    //            insparamDto.setSqlId(SqlConstants.R_FILE_SQL_ID_03);
            insparamDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01);
            insparamDto.setParams(insparams);
    //            List<Map<String, Object>> result = sqlService.executeQuery_common_save(insparamDto);
            List<Map<String, Object>> result = sqlService.executeQuery_select_for_func(insparamDto);
    //            int insCnt = sqlService.executeQuery_save(insparamDto);
    //            if(insCnt < 1) {
    //                throw new Exception();
    //            }

            // return
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
            res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

            List<SswResponseDataDTO> resultList = new ArrayList<SswResponseDataDTO>();
            SswResponseDataDTO resDto = new SswResponseDataDTO();
            resDto.setData(result);
            resDto.setSqlId(0);
            resultList.add(resDto);
            res.setResData(resultList);

            return ResponseEntity.status(HttpStatus.OK).body(res);

        } catch (MalformedURLException e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return ResponseEntity.status(HttpStatus.OK).body(res);
            //return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return ResponseEntity.status(HttpStatus.OK).body(res);
            //return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return ResponseEntity.status(HttpStatus.OK).body(res);
            //return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "파일 삭제", description = "파일 삭제")
    @Description("파일 삭제")
    @GetMapping("/api/file/fileDelete/{fileId}")
    public ResponseEntity<SswResponseDTO> fileDelete(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @PathVariable String fileId) throws ParseException {
        try {
            // 1. 파일id로 이미지경로+이름 가져옴
            String filePathNm = "";
            List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
            Map<String, Object> param = new HashMap<String, Object>();
            param.put("file_mng_no", fileId);
            params.add(param);

            SswRequestSqlDTO paramDto = new SswRequestSqlDTO();
            paramDto.setSqlId(SqlConstants.R_FILE_SQL_ID_01);
            paramDto.setParams(params);
            List<Map<String, Object>> fileResult = sqlService.executeQuery_select(paramDto);

            if(fileResult.size() == 0) {
                SswResponseDTO res = new SswResponseDTO();
                res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
                res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
                return ResponseEntity.status(HttpStatus.OK).body(res);
            }

            for(Map<String, Object> file : fileResult) {
                filePathNm = String.valueOf(file.get("path_nm")) + String.valueOf(file.get("encpt_nm")) + ".zip";
            }

            // 2. 파일찾아서 삭제 후, db에서도 삭제
            String fullImageName = imageEmpFolder + filePathNm;
            File file = new File(fullImageName);  // 파일 경로 설정
            if (file.exists()) {
                boolean isDeleted = file.delete();
                if (isDeleted) {

                    SswRequestSqlDTO delDto = new SswRequestSqlDTO();
                    delDto.setSqlId(SqlConstants.R_FILE_SQL_ID_04);
                    delDto.setParams(params);
                    int cntResult = sqlService.executeQuery_save(delDto);
                }
            }

            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
            res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
            return ResponseEntity.status(HttpStatus.OK).body(res);

        } catch (Exception e) {
            log.error("error", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(SswConstants.RESULT_MSG_FAIL);
            return ResponseEntity.status(HttpStatus.OK).body(res);
            //return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "파일 복사", description = "파일을 복사한다")
    @Description("파일 복사")
    @PostMapping("/api/file/fileCopy")
    public ResponseEntity<SswResponseDTO> fileCopy(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody Map<String, Object> params) throws ParseException {
        try {
            String fileId = String.valueOf(params.get("file_id"));
            if (fileId == null || "null".equals(fileId)) {
                throw new IllegalArgumentException("필수 파라미터(file_id)가 누락되었습니다");
            }

            // 1. 파일 정보 조회 - 소스코드의 기존 fileSearch 로직 활용
            String rprs_ognz_no = "";
            String filePathNm = "";
            String encpt_nm = "";
            String path_nm = "";
            String orgnfl_nm = "";
            String orgnfl_extn_nm = "";
            long orgnfl_sz = 0;
            String userNo = String.valueOf(params.get("user_no"));

            List<Map<String, Object>> searchParams = new ArrayList<Map<String, Object>>();
            Map<String, Object> searchParam = new HashMap<String, Object>();
            searchParam.put("file_id", fileId);
            searchParam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_FILE_KEY_03);
            searchParams.add(searchParam);

            SswRequestSqlDTO searchParamDto = new SswRequestSqlDTO();
            searchParamDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01);
            searchParamDto.setParams(searchParams);
            List<Map<String, Object>> fileResult = sqlService.executeQuery_select_for_func(searchParamDto);
            List<Map<String, Object>> fileResultMap = ((List)((Map)fileResult.get(0).get("data")).get("data"));

            if (fileResultMap.size() == 0) {
                throw new IllegalArgumentException("복사할 원본 파일이 존재하지 않습니다");
            }

            // 2. 파일 정보 추출
            Map<String, Object> fileInfo = (Map<String, Object>)fileResultMap.get(0);
            path_nm = String.valueOf(fileInfo.get("path_nm"));
            encpt_nm = String.valueOf(fileInfo.get("encpt_nm"));
            orgnfl_nm = String.valueOf(fileInfo.get("orgnfl_nm"));
            orgnfl_extn_nm = String.valueOf(fileInfo.get("orgnfl_extn_nm"));
            orgnfl_sz = Math.round(Double.parseDouble(String.valueOf(fileInfo.get("orgnfl_sz"))));
            rprs_ognz_no = path_nm.substring(0, 4);
            filePathNm = path_nm + encpt_nm + ".zip";

            // 3. 새 파일명 생성 (UUID)
            String newEncpt_nm = UUID.randomUUID().toString();
            
            // 4. 원본 파일 경로 및 복사할 대상 경로 설정
            String sourcePath = imageEmpFolder + filePathNm;
            String targetPath = imageEmpFolder + path_nm + newEncpt_nm + ".zip";

            // 5. 물리적으로 파일 복사
            File sourceFile = new File(sourcePath);
            File targetFile = new File(targetPath);
            
            if (!sourceFile.exists()) {
                throw new IOException("원본 파일을 찾을 수 없습니다: " + sourcePath);
            }
            
            // 상위 디렉토리가 존재하지 않으면 생성
            if (!targetFile.getParentFile().exists()) {
                targetFile.getParentFile().mkdirs();
            }
            
            // 파일 복사
            Files.copy(sourceFile.toPath(), targetFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            // 6. DB에 새 파일 정보 저장
            List<Map<String, Object>> insparams = new ArrayList<Map<String, Object>>();
            Map<String, Object> insparam = new HashMap<String, Object>();
            
            // 파일명에 "(복사)" 추가
            String newFileName = orgnfl_nm;
            if (params.containsKey("new_file_name") && params.get("new_file_name") != null) {
                newFileName = String.valueOf(params.get("new_file_name"));
            } else {
                //newFileName = orgnfl_nm + " (복사)";
                newFileName = orgnfl_nm;
            }
            
            String newFileId = UUID.randomUUID().toString();
            insparam.put("file_id", newFileId);
            insparam.put("orgnfl_nm", newFileName);
            insparam.put("orgnfl_extn_nm", orgnfl_extn_nm);
            insparam.put("orgnfl_sz", orgnfl_sz);
            insparam.put("encpt_nm", newEncpt_nm);
            insparam.put("user_no", userNo);
            insparam.put("rprs_ognz_no", rprs_ognz_no);
            insparam.put("path_nm", path_nm);
            insparam.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_FILE_KEY_02);
            insparams.add(insparam);

            SswRequestSqlDTO insparamDto = new SswRequestSqlDTO();
            insparamDto.setSqlId(SqlConstants.REDIS_SQL_FILE_01);
            insparamDto.setParams(insparams);
            List<Map<String, Object>> result = sqlService.executeQuery_select_for_func(insparamDto);
            
            // 7. 응답 생성
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
            res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

            List<SswResponseDataDTO> resultList = new ArrayList<SswResponseDataDTO>();
            SswResponseDataDTO resDto = new SswResponseDataDTO();
            resDto.setData(result);
            resDto.setSqlId(0);
            resultList.add(resDto);
            res.setResData(resultList);

            return ResponseEntity.status(HttpStatus.OK).body(res);

        } catch (IllegalArgumentException e) {
            log.error("파라미터 오류: " + e.getMessage(), e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg(e.getMessage());
            return ResponseEntity.status(HttpStatus.OK).body(res);
        } catch (IOException e) {
            log.error("파일 복사 오류: " + e.getMessage(), e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg("파일 복사 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.OK).body(res);
        } catch (Exception e) {
            log.error("파일 복사 중 오류 발생", e);
            SswResponseDTO res = new SswResponseDTO();
            res.setRtnCode(SswConstants.RESULT_CODE_FAIL);
            res.setRtnMsg("파일 복사 중 오류가 발생했습니다");
            return ResponseEntity.status(HttpStatus.OK).body(res);
        }
    }

    // 파일을 ZIP으로 저장
    private void addFileToZip(MultipartFile file, ZipOutputStream zipOut) throws IOException {
        try (InputStream fis = file.getInputStream()) {
            // 원본 파일을 ZIP 엔트리로 추가
            ZipEntry zipEntry = new ZipEntry(file.getOriginalFilename());  // 원본 파일명을 그대로 사용
            zipOut.putNextEntry(zipEntry);

            byte[] bytes = new byte[1024];
            int length;
            while ((length = fis.read(bytes)) >= 0) {
                zipOut.write(bytes, 0, length);
            }
            zipOut.closeEntry();
        }
    }

    // ZIP 파일에서 이미지 추출하는 메서드
    private Path extractImageFromZip(Path zipFilePath, Path tempDir) throws IOException {


        // ZIP 파일을 읽고, 이미지 파일을 추출하여 임시 디렉토리에 저장
        try (ZipInputStream zipIn = new ZipInputStream(Files.newInputStream(zipFilePath))) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                // 이미지 파일이라면, 해당 파일을 추출
                //if (entry.getName().endsWith(".jpg") || entry.getName().endsWith(".png")) {
                    Path extractedFilePath = tempDir.resolve(entry.getName());

                    // 추출한 파일을 디스크에 저장
                    try (OutputStream out = Files.newOutputStream(extractedFilePath)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zipIn.read(buffer)) > 0) {
                            out.write(buffer, 0, len);
                        }
                    }

                zipIn.closeEntry();

                    // 추출한 파일 반환
                    return extractedFilePath;
                //}
                //
            }
        }

        // 이미지 파일이 없다면 null 반환
        return null;
    }

    private Path extractFileFromZip(Path zipFilePath, String extractToPath) throws IOException {
        Path outputPath = Paths.get(extractToPath);
        Path lastExtractedPath = null;

        // 디렉토리가 없으면 생성
        if (!Files.exists(outputPath)) {
            Files.createDirectories(outputPath);
        }

        // 시도할 인코딩 목록
        List<String> encodings = Arrays.asList("UTF-8", "CP949", "EUC-KR");

        // 각 인코딩으로 시도
        for (String encoding : encodings) {
            try {
                lastExtractedPath = tryExtractWithEncoding(zipFilePath, outputPath, encoding);
                if (lastExtractedPath != null) {
                    // 성공적으로 추출됨
                    return lastExtractedPath;
                }
            } catch (Exception e) {
                // 이 인코딩으로 실패하면 다음 인코딩 시도
                log.warn("인코딩 " + encoding + "으로 추출 실패: " + e.getMessage());
            }
        }

        // 모든 인코딩이 실패하면 예외 발생
        throw new IOException("지원되는 모든 인코딩으로 ZIP 파일 추출 실패");
    }

    private Path tryExtractWithEncoding(Path zipFilePath, Path outputPath, String encoding) throws IOException {
        Path extractedFilePath = null;
        boolean filesExtracted = false;

        try (ZipFile zipFile = new ZipFile(zipFilePath.toFile(), Charset.forName(encoding))) {
            // ZipFile에서 항목을 읽고 파일을 추출
            Enumeration<? extends ZipEntry> entries = zipFile.entries();

            if (!entries.hasMoreElements()) {
                log.error("ZIP 파일이 비어있거나 읽을 수 없습니다.");
                return null;
            }

            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                extractedFilePath = outputPath.resolve(entry.getName());

                // 디렉토리인 경우 경로 생성
                if (entry.isDirectory()) {
                    Files.createDirectories(extractedFilePath);
                } else {
                    // 상위 디렉토리가 없는 경우 생성
                    if (extractedFilePath.getParent() != null) {
                        Files.createDirectories(extractedFilePath.getParent());
                    }

                    // 파일인 경우, 해당 파일을 추출하여 지정된 경로에 저장
                    try (InputStream in = zipFile.getInputStream(entry);
                         OutputStream out = Files.newOutputStream(extractedFilePath)) {
                        byte[] buffer = new byte[4096]; // 버퍼 크기 증가
                        int len;
                        while ((len = in.read(buffer)) > 0) {
                            out.write(buffer, 0, len);
                        }
                        filesExtracted = true;
                        log.debug("파일 추출 성공: " + extractedFilePath + " (인코딩: " + encoding + ")");
                    }
                }
            }
        }

        // 파일이 추출되었으면 마지막으로 추출된 파일 경로 반환
        return filesExtracted ? extractedFilePath : null;
    }

    // ZIP 파일에서 파일 추출하는 메서드
    private Path extractFileFromZip2(Path zipFilePath, String extractToPath) throws IOException {
        // ZIP 파일을 읽고, 압축을 해제
        Path outputPath = Paths.get(extractToPath);

        // 디렉토리가 없으면 생성
        if (!Files.exists(outputPath)) {
            Files.createDirectories(outputPath);  // 디렉토리 생성
        }

        try (ZipInputStream zipIn = new ZipInputStream(Files.newInputStream(zipFilePath), Charset.forName("UTF-8"))) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                // 압축 해제 경로 지정
                Path extractedFilePath = outputPath.resolve(entry.getName());

                // 디렉토리인 경우 경로 생성
                if (entry.isDirectory()) {
                    Files.createDirectories(extractedFilePath);  // 디렉토리 생성
                } else {
                    // 파일인 경우, 해당 파일을 추출하여 지정된 경로에 저장
                    try (OutputStream out = Files.newOutputStream(extractedFilePath)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zipIn.read(buffer)) > 0) {
                            out.write(buffer, 0, len);
                        }
                    }
                }

                zipIn.closeEntry();

                return extractedFilePath;
            }
        }

        // 마지막으로 추출된 파일 경로 반환
        return null;
    }

}
