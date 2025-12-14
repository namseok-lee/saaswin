package saas.win.SaaSwin.eformsign.service;

import ch.qos.logback.core.util.StringUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.eformsign.dto.EformsignDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.util.SswUtils;

import java.io.*;
import java.math.BigInteger;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RequiredArgsConstructor
@Service
@Slf4j
public class EformsignApiCallService {

    // 비밀키
    @Value("${eformsign.signature.secretkey}")
    private String secretKey;

    // 키를 base64로 변환
    @Value("${eformsign.signature.key.base64}")
    private String keybase64;

    // accessToken 얻어오는 api url
    @Value("${eformsign.api.token}")
    private String tokenurl;

    // 실제 호출할 api
    @Value("${eformsign.api.call}")
    private String ko_apiurl;

    @Transactional
    public SswResponseDTO thumbnail_temp_common(@RequestBody EformsignDTO dto) throws ParseException, SQLException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, UnsupportedEncodingException, SignatureException {

        try {
            // 0. 토큰발급
            EformsignDTO tokenInfo = null; //getToken("jjlee@win.co.kr");

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

    // api 호출
    // member_id , call_api_url , param에 data1이란 이름으로 파라미터 있어야함.
    public HttpResponse<InputStream> callGet(EformsignDTO dto) throws URISyntaxException, IOException, InterruptedException {

        // 0. 토큰발급 - member_id로 - access_token , refresh_token , api_url을 가져옴
        getToken(dto);

        // 1. 호출 url 생성
        String apiUrl = StringUtils.isBlank(dto.getApi_url()) ? ko_apiurl : dto.getApi_url();
        String callApiUrl = dto.getCall_api_url();
        if(dto.getParam() != null && dto.getParam().get("data1") != null) {
            callApiUrl = callApiUrl.replaceAll("data1", String.valueOf(dto.getParam().get("data1")));
        }
        String url = apiUrl + callApiUrl;

        URI uri = new URI(url);
        // HttpClient 생성
        HttpClient client = HttpClient.newHttpClient();

        // HttpRequest 생성
        HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Content-Type", "application/json; utf-8")
                .header("Accept", "*/*")
                .header("Authorization", "Bearer " + dto.getAccess_token())
                //.POST(HttpRequest.BodyPublishers.ofString(paramJson))
                .GET()
                .build();

        // 요청 보내기 및 응답 받기
        HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

        return response;
    }

    // 토큰얻기
    public EformsignDTO getToken(EformsignDTO dto) {
        try {
            // 0. 서명
            String signature = getSignature();
            String execution_time = signature.split(",")[0];
            String eformsign_signature = signature.split(",")[1];

            // 요청할 URI
            URI requestUri = new URI(tokenurl);

            // HTTP 검사 객체 생성
            HttpClient client = HttpClient.newHttpClient();

            // JSON 데이터 설정
            Map<String, Object> paramMap = new HashMap<String, Object>();
            paramMap.put("execution_time", execution_time);
            paramMap.put("member_id", dto.getMember_id());
            String paramJson = SswUtils.convertMapToJson(paramMap);

            //String jsonInputString = "{\"execution_time\":\"" + execution_time + "\",\"member_id\":\"" + member_id + "\"}";

            // HTTP 요청 생성
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(requestUri)
                    .header("Content-Type", "application/json; utf-8")
                    .header("Authorization", "Bearer " + keybase64)
                    .header("eformsign_signature", eformsign_signature)
                    .POST(HttpRequest.BodyPublishers.ofString(paramJson))
                    .build();

            // HTTP 응답
            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            log.debug("Response Code: " + response.statusCode());

            // 응답 개체화
            BufferedReader br = new BufferedReader(new InputStreamReader(response.body(), "utf-8"));
            StringBuilder responseContent = new StringBuilder();
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                responseContent.append(responseLine.trim());
            }
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            JsonElement jsonElement = JsonParser.parseString(responseContent.toString());
            log.debug("Response: " + gson.toJson(jsonElement));

            Map<String, Object> resMap = SswUtils.convertJsonToMap(gson.toJson(jsonElement));
            if(response.statusCode() != 200) {
                log.error("eformsign accesstoken error : " + gson.toJson(jsonElement));
                return null;
            }

            dto.setAccess_token(String.valueOf(((Map)resMap.get("oauth_token")).get("access_token")));
            dto.setRefresh_token(String.valueOf(((Map)resMap.get("oauth_token")).get("refresh_token")));
            dto.setApi_url(String.valueOf(((Map)(((Map)resMap.get("api_key")).get("company"))).get("api_url")));
            return dto;
        } catch (Exception e) {
            log.error("error", e);
            return null;
        }
    }

    // 서명얻기
    private String getSignature() {
        String result = "";
        try {
            // 개인 비밀키 생성
            byte[] privateKeyBytes = new BigInteger(secretKey, 16).toByteArray();
            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            PKCS8EncodedKeySpec pkcs8KeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            PrivateKey privateKey = keyFactory.generatePrivate(pkcs8KeySpec);

            // 시간 값 생성
            long execution_time = new Date().getTime();
            String execution_time_str = String.valueOf(execution_time);

            // ECDSA 서명생성
            Signature ecdsa = Signature.getInstance("SHA256withECDSA");
            ecdsa.initSign(privateKey);
            ecdsa.update(execution_time_str.getBytes("UTF-8"));
            String eformsign_signature = new BigInteger(ecdsa.sign()).toString(16);

            // 경과 출력
            log.debug("execution_time: " + execution_time);
            log.debug("eformsign_signature: " + eformsign_signature);

            return execution_time + "," + eformsign_signature;
        }
        catch (Exception e) {
            log.error("error", e);
        }

        return result;
    }


}
