package saas.win.SaaSwin.eformsign.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.eformsign.dto.EformsignDTO;
import saas.win.SaaSwin.google.calendar.dto.GoogleCalendarDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.util.SswUtils;

import javax.sql.DataSource;
import java.io.*;
import java.math.BigInteger;
import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RequiredArgsConstructor
@Service
@Slf4j
public class EformsignService {

    @Value("${image.emp.folder}")
    private String filepath;

    @Value("${eformsign.api.template.list}")
    private String gettemplateurl;

    @Value("${eformsign.api.file.image}")
    private String getimageurl;

    private final EformsignApiCallService eformsignApiCallService;

    private final SqlService sqlService;

    @Transactional
    public SswResponseDTO template_insert(@RequestBody EformsignDTO dto) throws ParseException, SQLException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, UnsupportedEncodingException, SignatureException {

        /*
         * test source
         */
        dto = new EformsignDTO();
        dto.setCall_api_url(getimageurl);
        dto.setMember_id("digestns@win.co.kr");
        dto.setTemplate_id("71710b968c4b453d82b31505be09915b");

        getThunmbnail(dto);
        /*
         * test source
         */

        // 1. 템플릿 db 등록
        // - 템플릿생성해서 화면에서 보내준 response 와 매칭되도록 dto 수정해야함
        // - user_no와 rprs_ognz_no 로 멤버id를 구함. -> 고정이라면 jjlee@win.co.kr 를 박음
        // 임시
        Map<String, Object> param = dto.getParam();
        param.put("member_id", "digestns@win.co.kr");
        dto.setCall_api_url(getimageurl);
        // ** db에서 member_id 따로 가져와서 넣어야 할수도있음
        dto.setMember_id("digestns@win.co.kr");
        // ** 파라미터중에 form_image_id 있다면 넣고, 없다면 템플릿api 호출해보아야함
        //dto.getParam().put("template_id", "f65097168ea646ee84b0ed71e20f49e7");
        List<Map<String, Object>> listParam = new ArrayList<Map<String, Object>>();
        listParam.add(dto.getParam()); // 이것도 call by reference 형식으로 member_id가 들어가있는지 확인해볼것

        SswRequestSqlDTO sqldto = new SswRequestSqlDTO();
        sqldto.setSqlId(SqlConstants.EFS_SQL_ID_01);
        sqldto.setParams(listParam);
        List<Map<String, Object>> result = sqlService.executeQuery_common_save(sqldto);
        if(!SqlConstants.COMMON_SQL_SUCCESS_CODE.equals(result.get(0).get("return_cd"))){

        }

        // 2. 템플릿 image 가져오기 ( thumbnail )
        // 2.0. 파일이미지정보가없다면 -> 템플릿조회하는 api 추가 call해서 fileId를 넘겨주어야함
        // 2.1. api call해서 file 가져오기
        // 2.2. file있다면 file 서버에 넣기
        // 2.2. file있다면 file db에 insert
        // 2.3. file있다면 템플릿db에 file id update
        getThunmbnail(dto);

        return null;
    }

    // 섬네일 가져오기
    private String getThunmbnail(EformsignDTO dto) throws ParseException, SQLException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, UnsupportedEncodingException, SignatureException {
        String result = "";
        try {
            // template list api 호출
            String file_image_id = "";
            EformsignDTO dto2 = new EformsignDTO();
            dto2.setCall_api_url(gettemplateurl);
            dto2.setMember_id("digestns@win.co.kr");
            HttpResponse<InputStream> template_response = eformsignApiCallService.callGet(dto2);
            // JSON 응답 처리
            // buffer에 있는것 읽어서 처리
            if (template_response.statusCode() >= 200 && template_response.statusCode() < 300) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(template_response.body(), "utf-8"))) {
                    StringBuilder responseContent = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        responseContent.append(responseLine.trim());
                    }
                    Gson gson = new GsonBuilder().setPrettyPrinting().create();
                    JsonElement jsonElement = JsonParser.parseString(responseContent.toString());
                    String prettyJsonString = gson.toJson(jsonElement);
                    log.debug("JSON Response: " + prettyJsonString);
                    Map<String, Object> resMap = SswUtils.convertJsonToMap(prettyJsonString);
                    //file_image_id = resMap.get("");

                    List<Map<String, Object>> templates = (List<Map<String, Object>>) resMap.get("templates");

                    for (Map<String, Object> template : templates) {
                        if (dto.getTemplate_id().equals(template.get("form_id"))) {
                            dto.setForm_imgae_id(String.valueOf(((Map) template.get("file")).get("form_image_id")));
                            break;
                        }
                    }
                }
            }

            // 섬네일관련 api 호출
            Map<String, Object> param = new HashMap<String, Object>();
            param.put("data1", dto.getForm_imgae_id());
            dto.setParam(param);
            HttpResponse<InputStream> response = eformsignApiCallService.callGet(dto);
            log.debug("POST Response Code :: " + response.statusCode());

            HttpHeaders headers = response.headers();
            String contentType = headers.firstValue("Content-Type").orElse("");
            log.debug("Content-Type :: " + contentType);

            // buffer에 있는것 읽어서 처리
            if (response.statusCode() >= 200 && response.statusCode() < 300) {

                InputStream inputStream = response.body();
                byte[] imageBytes = inputStream.readAllBytes();

                // 응답에서 Base64로 인코딩된 데이터가 data:image/png;base64, 형태일 경우
                String base64Image = new String(imageBytes);
                if (base64Image.startsWith("data:image/png;base64,")) {
                    base64Image = base64Image.substring("data:image/png;base64,".length());
                }

                // Base64로 디코딩
                byte[] decodedBytes = Base64.getDecoder().decode(base64Image);

                // file저장 - /WIN/efs/ 에 파일저장
                // file db에 insert
                // 템플릿 db에 update

                // 디코딩된 이미지를 파일로 저장
                try (FileOutputStream fos = new FileOutputStream("output_image.png")) {
                    fos.write(decodedBytes);
                } catch (IOException e) {
                    log.error("error", e);
                }

            } else {
                // 오류 응답을 읽고 출력
                try (BufferedReader br = new BufferedReader(new InputStreamReader(response.body(), "utf-8"))) {
                    StringBuilder responseContent = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        responseContent.append(responseLine.trim());
                    }
                    Gson gson = new GsonBuilder().setPrettyPrinting().create();
                    JsonElement jsonElement = JsonParser.parseString(responseContent.toString());
                    String prettyJsonString = gson.toJson(jsonElement);

                    log.error("efs Error Response: " + prettyJsonString);
                }
            }
        }
        catch(Exception e) {
            log.error("efs error", e);
        }

        return result;
    }




    @Transactional
    public SswResponseDTO thumbnail_temp_common(@RequestBody EformsignDTO dto) throws ParseException, SQLException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, UnsupportedEncodingException, SignatureException {

        try {
            // 0. 토큰발급
            EformsignDTO tokenInfo = null ;//getToken("jjlee@win.co.kr");

            //String thumbnailUrl = tokenInfo.getApi_url() + "/v2.0/api/template_image/" + "59bbe64b49674af98fa42013283af4fc";
            String thumbnailUrl = tokenInfo.getApi_url() + "/v2.0/api/template_image/" + "f65097168ea646ee84b0ed71e20f49e7";
            URI uri = new URI(thumbnailUrl);
            // HttpClient 생성
            HttpClient client = HttpClient.newHttpClient();

            // 파라미터
            String paramJson = "";

            // HttpRequest 생성
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Content-Type", "application/json; utf-8")
                    .header("Accept", "*/*")
                    .header("Authorization", "Bearer " + tokenInfo.getAccess_token())
                    //.POST(HttpRequest.BodyPublishers.ofString(paramJson))
                    .GET()
                    .build();

            // 요청 보내기 및 응답 받기
            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            log.debug("요청 URI : " + request.uri());
            log.debug("POST Response Code :: " + response.statusCode());
            HttpHeaders headers = response.headers();
            String contentType = headers.firstValue("Content-Type").orElse("");
            log.debug("Content-Type :: " + contentType);

            // 응답 콘텐츠 타입에 따른 처리
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                if (contentType.contains("application/zip")) {
                    // ZIP 파일 처리
                    try (InputStream is = response.body();
                         BufferedInputStream bis = new BufferedInputStream(is);
                         ZipInputStream zis = new ZipInputStream(bis)) {

                        ZipEntry zipEntry;
                        while ((zipEntry = zis.getNextEntry()) != null) {
                            String fileName = zipEntry.getName();
                            log.debug("Extracting file: " + fileName);

                            // 디렉토리 생성
                            File newFile = new File("output_directory/document/" + fileName);
                            new File(newFile.getParent()).mkdirs();

                            // 파일 저장
                            try (FileOutputStream fos = new FileOutputStream(newFile)) {
                                byte[] buffer = new byte[1024];
                                int len;
                                while ((len = zis.read(buffer)) > 0) {
                                    fos.write(buffer, 0, len);
                                }
                            }
                            zis.closeEntry();
                        }
                    }
                } else if (contentType.contains("application/json")) {
                    // JSON 응답 처리
                    try (BufferedReader br = new BufferedReader(new InputStreamReader(response.body(), "utf-8"))) {
                        StringBuilder responseContent = new StringBuilder();
                        String responseLine;
                        while ((responseLine = br.readLine()) != null) {
                            responseContent.append(responseLine.trim());
                        }
                        Gson gson = new GsonBuilder().setPrettyPrinting().create();
                        JsonElement jsonElement = JsonParser.parseString(responseContent.toString());
                        String prettyJsonString = gson.toJson(jsonElement);
                        log.debug("JSON Response: " + prettyJsonString);
                    }
                } else if (contentType.contains("application/octet-stream")) {
                    // 파일 응답 처리
                    String disposition = headers.firstValue("Content-Disposition").orElse("");
                    String fileName = "downloaded_file";
                    if (disposition.contains("filename=")) {
                        fileName = disposition.split("filename=")[1].replace("\"", "");
                    }

                    try (InputStream is = response.body();
                         FileOutputStream fos = new FileOutputStream(new File("output_directory/file/" + fileName))) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = is.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                        log.debug("File downloaded: " + fileName);
                    }
                } else if (contentType.contains("application/pdf")) {
                    // PDF 응답 처리
                    String fileName = "downloaded.pdf";
                    String disposition = headers.firstValue("Content-Disposition").orElse("");
                    if (disposition.contains("filename=")) {
                        fileName = URLDecoder.decode(disposition.split("filename=")[1].replace("\"", ""), "UTF-8").split(";")[0];
                    }

                    try (InputStream is = response.body();
                         FileOutputStream fos = new FileOutputStream(new File("output_directory/pdf/" + fileName))) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = is.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                        log.debug("PDF downloaded: " + fileName);
                    }
                } else {
                    log.debug("Unhandled Content-Type: " + contentType);
                }
            } else {
                // 오류 응답을 읽고 출력
                try (BufferedReader br = new BufferedReader(new InputStreamReader(response.body(), "utf-8"))) {
                    StringBuilder responseContent = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        responseContent.append(responseLine.trim());
                    }
                    Gson gson = new GsonBuilder().setPrettyPrinting().create();
                    JsonElement jsonElement = JsonParser.parseString(responseContent.toString());
                    String prettyJsonString = gson.toJson(jsonElement);
                    log.debug("Error Response: " + prettyJsonString);
                }
            }

        }
        catch (Exception e) {
            log.error("error", e);
        }


        return null;
    }

    @Transactional
    public Map<String, Object> gettoken(EformsignDTO dto) throws ParseException, SQLException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, UnsupportedEncodingException, SignatureException {

        dto.setMember_id("digestns@win.co.kr");
        eformsignApiCallService.getToken(dto);
        Map<String, Object> result = SswUtils.convertDTOToMap(dto);
        return result;
    }


    // 템플릿 가져오기
    private String getTemplate(EformsignDTO dto) {



        return null;
    }


}
