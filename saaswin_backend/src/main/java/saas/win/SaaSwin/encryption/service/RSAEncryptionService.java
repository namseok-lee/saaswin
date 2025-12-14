package saas.win.SaaSwin.encryption.service;

import com.jcraft.jsch.*;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
// import javax.annotation.PostConstruct;
import jakarta.annotation.PostConstruct;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDataDTO;
import saas.win.SaaSwin.ssw.service.SswService;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
// import java.security.*; // Replace wildcard import
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException; // Needed for KeyPairGenerator
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Security; // Needed for Security.addProvider
import java.security.spec.InvalidKeySpecException; // Needed for KeyFactory
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.text.ParseException;
import java.security.spec.MGF1ParameterSpec; // 올바른 패키지 경로
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.Cipher;
import javax.crypto.SecretKey; // AES 키 인터페이스
import javax.crypto.spec.IvParameterSpec; // AES IV 스펙
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import javax.crypto.spec.SecretKeySpec; // AES 키 구현
import javax.crypto.spec.GCMParameterSpec; // GCM용 파라미터 스펙 추가
import java.util.stream.Collectors;

@Service
public class RSAEncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(RSAEncryptionService.class);
    private final SswService sswService;

    // !!! WARNING: Hardcoding credentials is insecure. Use external configuration.
    // !!!
    // Consider using @Value annotations to load from application.properties or
    // environment variables
    private final String sshHost = "218.236.10.150";
    private final String sshUser = "win";
    private final String sshPassword = "win!@3456"; // Store securely!
    private final int sshPort = 22; // Default SSH port
    private final String remoteKeyBasePath = "/opt/crypto_server/private_keys/";

    // Add BouncyCastle provider statically
    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    private PrivateKey privateKey; // Internal key pair (if needed for other methods)
    private PublicKey publicKey; // Internal key pair (if needed for other methods)

    public RSAEncryptionService(SswService sswService) {
        this.sswService = sswService;
    }

    @PostConstruct
    public void init() {
        // Initialize internal key pair if necessary, or remove if only external keys
        // are used
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            this.privateKey = keyPair.getPrivate();
            this.publicKey = keyPair.getPublic();
            logger.info("Internal RSA key pair generated (if needed).");
        } catch (Exception e) {
            logger.error("Error generating internal RSA key pair.", e);
            // Decide if this is critical. Maybe don't throw RuntimeException if internal
            // keys aren't essential.
            // throw new RuntimeException("키 생성 중 오류가 발생했습니다.", e);
        }
    }

    // --- Methods using internal key pair (keep if needed) ---
    public String getPublicKeyString() {
        if (publicKey == null)
            return null;
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    public String getPrivateKeyString() {
        if (privateKey == null)
            return null;
        return Base64.getEncoder().encodeToString(privateKey.getEncoded());
    }

    public String encrypt(String plainText) {
        if (publicKey == null) {
            throw new RuntimeException("Internal public key not available for encryption.");
        }
        try {
            // Specify padding explicitly for consistency if needed, e.g.,
            // "RSA/ECB/PKCS1Padding"
            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding"); // Or OAEP if that's the standard
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            logger.error("Error encrypting with internal key", e);
            throw new RuntimeException("암호화 중 오류가 발생했습니다.", e);
        }
    }

    public String decrypt(String encryptedText) {
        if (privateKey == null) {
            throw new RuntimeException("Internal private key not available for decryption.");
        }
        try {
            // Match padding with encryption method
            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding"); // Or OAEP
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedText);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Error decrypting with internal key", e);
            throw new RuntimeException("복호화 중 오류가 발생했습니다.", e);
        }
    }

    // --- Methods handling key strings (modified for PEM) ---

    public PublicKey getPublicKeyFromString(String publicKeyStr) {
        try {
            String base64Key = publicKeyStr
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA"); // Default provider is fine for public keys
            return keyFactory.generatePublic(spec);
        } catch (Exception e) {
            logger.error("Error converting public key string", e);
            throw new RuntimeException("공개키 변환 중 오류가 발생했습니다.", e);
        }
    }

    public PrivateKey getPrivateKeyFromString(String privateKeyPem) { // Renamed param for clarity
        try {
            String base64Key = privateKeyPem
                    .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END RSA PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA", BouncyCastleProvider.PROVIDER_NAME);
            return keyFactory.generatePrivate(spec);
        } catch (Exception e) {
            logger.error("Error converting private key PEM string", e);
            throw new RuntimeException("개인키 변환 중 오류가 발생했습니다.", e);
        }
    }

    // --- Methods using provided keys (external/remote) ---

    // *MODIFIED* - Encrypt using a provided public key with explicit OAEP params
    public String encryptWithPublicKey(String plainText, String publicKeyStr) {
        try {
            PublicKey providedPublicKey = getPublicKeyFromString(publicKeyStr);
            // Explicitly specify OAEP parameters for consistency with Web Crypto API
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            cipher.init(Cipher.ENCRYPT_MODE, providedPublicKey,
                    new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            logger.error("Error encrypting with provided public key and OAEP parameters", e);
            throw new RuntimeException("OAEP 파라미터를 사용한 암호화 중 오류가 발생했습니다.", e);
        }
    }

    // *MODIFIED* - Decrypt using a private key loaded from remote, with explicit
    // OAEP params
    public String decryptWithRemotePrivateKey(String encryptedText, String userNo) {
        try {
            // 1. Load PEM content from remote file
            String privateKeyPem = loadPrivateKeyPemFromRemoteFile(userNo);

            // 2. Generate PrivateKey from PEM
            PrivateKey key = getPrivateKeyFromString(privateKeyPem);

            // 3. Decrypt using the loaded key WITH explicit OAEP parameters
            // Ensure padding matches encryption method (OAEP with SHA-256)
            // Replaced implicit decryption with the explicit OAEP method call
            return decryptRSAWithOAEP(encryptedText, key); // Use the explicit OAEP decryption method

        } catch (JSchException e) {
            logger.error("SSH connection error for userNo {}: {}", userNo, e.getMessage(), e);
            throw new RuntimeException("원격 서버 접속 중 오류가 발생했습니다.", e);
        } catch (SftpException e) {
            logger.error("SFTP error accessing key file for userNo {}: {}", userNo, e.getMessage(), e);
            if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                throw new RuntimeException("사용자(" + userNo + ")의 개인키 파일을 찾을 수 없습니다.", e);
            } else {
                throw new RuntimeException("개인키 파일 접근 중 오류가 발생했습니다.", e);
            }
        } catch (Exception e) {
            logger.error("Error during decryption process for userNo {} with OAEP params: {}", userNo, e.getMessage(),
                    e);
            // Re-throw the specific runtime exception from decryptRSAWithOAEP if it occurs
            if (e instanceof RuntimeException && e.getMessage().contains("OAEP 파라미터를 사용한 복호화 중 오류")) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("OAEP 파라미터를 사용한 복호화 처리 중 오류가 발생했습니다.", e);
        }
    }

    // Helper method to load PEM content from remote file
    private String loadPrivateKeyPemFromRemoteFile(String userNo) throws JSchException, SftpException, IOException {
        Session session = null;
        ChannelSftp channelSftp = null;
        InputStream inputStream = null;
        BufferedReader reader = null;
        String remoteFilePath = remoteKeyBasePath + userNo + ".pem";
        logger.info("Attempting to load private key from remote path: {}", remoteFilePath);

        try {
            JSch jsch = new JSch();
            // For production, use key-based auth instead of password
            // jsch.addIdentity("path/to/private/key");
            session = jsch.getSession(sshUser, sshHost, sshPort);
            session.setPassword(sshPassword); // Insecure!

            // Avoid strict host key checking for simplicity (NOT RECOMMENDED for
            // production)
            java.util.Properties config = new java.util.Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);

            session.connect();
            logger.debug("SSH Session connected to {}", sshHost);

            channelSftp = (ChannelSftp) session.openChannel("sftp");
            channelSftp.connect();
            logger.debug("SFTP Channel connected.");

            inputStream = channelSftp.get(remoteFilePath);
            logger.debug("Successfully opened input stream for {}", remoteFilePath);

            // Read the stream content into a String
            reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String pemContent = reader.lines().collect(Collectors.joining(System.lineSeparator()));
            logger.info("Successfully read PEM content for userNo {}", userNo);
            return pemContent;

        } finally {
            // Ensure resources are closed
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    logger.warn("Error closing BufferedReader", e);
                }
            }
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    logger.warn("Error closing InputStream", e);
                }
            }
            if (channelSftp != null && channelSftp.isConnected()) {
                channelSftp.disconnect();
                logger.debug("SFTP Channel disconnected.");
            }
            if (session != null && session.isConnected()) {
                session.disconnect();
                logger.debug("SSH Session disconnected.");
            }
        }
    }

    // Keep the old decryptWithPrivateKey if needed for backward compatibility or
    // other uses
    // Otherwise, remove it if decryptWithRemotePrivateKey is the only decryption
    // method now
    public String decryptWithPrivateKey(String encryptedText, String privateKeyPem) {
        logger.warn(
                "Using deprecated decryptWithPrivateKey (PEM string input). Consider using decryptWithRemotePrivateKey.");
        try {
            PrivateKey key = getPrivateKeyFromString(privateKeyPem);
            // Ensure padding matches encryption method (likely OAEP from frontend)
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedText);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Error decrypting with provided private key PEM", e);
            throw new RuntimeException("복호화 중 오류가 발생했습니다.", e);
        }
    }

    // 특정 OAEP 파라미터를 사용한 복호화 메소드 추가
    public String decryptRSAWithOAEP(String encryptedData, PrivateKey privateKey) {
        try {
            // 클라이언트(Web Crypto API)에서 RSA-OAEP 및 SHA-256을 사용하여 암호화한 경우,
            // 서버에서도 RSA/ECB/OAEPWithSHA-256AndMGF1Padding을 설정하고
            // OAEPParameterSpec를 사용하여 세부 설정을 해야 함
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");

            // OAEPParameterSpec는 RSA-OAEP 암호화에서 패딩 방식을 세부적으로 설정
            cipher.init(Cipher.DECRYPT_MODE, privateKey,
                    new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));

            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Error decrypting with OAEP parameters", e);
            throw new RuntimeException("OAEP 파라미터를 사용한 복호화 중 오류가 발생했습니다.", e);
        }
    }

    // 원격 서버에서 가져온 키로 OAEP 파라미터를 사용하여 복호화하는 메소드 추가
    public String decryptWithRemotePrivateKeyOAEP(String encryptedText, String userNo) {
        try {
            // 1. 원격 파일에서 PEM 형식의 개인키 로드
            String privateKeyPem = loadPrivateKeyPemFromRemoteFile(userNo);

            // 2. PEM에서 PrivateKey 객체 생성
            PrivateKey key = getPrivateKeyFromString(privateKeyPem);

            // 3. OAEP 파라미터를 사용하여 복호화
            return decryptRSAWithOAEP(encryptedText, key);

        } catch (JSchException e) {
            logger.error("SSH connection error for userNo {}: {}", userNo, e.getMessage(), e);
            throw new RuntimeException("원격 서버 접속 중 오류가 발생했습니다.", e);
        } catch (SftpException e) {
            logger.error("SFTP error accessing key file for userNo {}: {}", userNo, e.getMessage(), e);
            if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                throw new RuntimeException("사용자(" + userNo + ")의 개인키 파일을 찾을 수 없습니다.", e);
            } else {
                throw new RuntimeException("개인키 파일 접근 중 오류가 발생했습니다.", e);
            }
        } catch (Exception e) {
            logger.error("Error during decryption process for userNo {}: {}", userNo, e.getMessage(), e);
            throw new RuntimeException("복호화 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 하이브리드 암호화된 데이터 복호화 (RSA로 AES키 복호화 -> AES-GCM으로 데이터 복호화)
     *
     * @param encryptedDataBase64   Base64 인코딩된 AES-GCM 암호화 데이터 (암호문 + 인증태그 포함)
     * @param encryptedAesKeyBase64 Base64 인코딩된 RSA 암호화된 AES 키
     * @param ivBase64              Base64 인코딩된 AES-GCM IV (12바이트여야 함)
     * @param userNo                개인키를 식별하기 위한 사용자 번호
     * @return 복호화된 원본 텍스트
     */
    public String decryptHybrid(String encryptedDataBase64, String encryptedAesKeyBase64, String ivBase64,
            String userNo) {
        final int GCM_TAG_LENGTH_BIT = 128; // AES-GCM 표준 인증 태그 길이 (16 Bytes)
        final int GCM_IV_LENGTH_BYTE = 16; // 프론트엔드에서 사용하는 IV 길이

        try {
            // 1. 사용자 RSA 개인키 로드
            String privateKeyPem = loadPrivateKeyPemFromRemoteFile(userNo);
            PrivateKey rsaPrivateKey = getPrivateKeyFromString(privateKeyPem);

            // 2. RSA 개인키로 AES 키 복호화 (OAEP 사용)
            byte[] encryptedAesKeyBytes = Base64.getDecoder().decode(encryptedAesKeyBase64);
            byte[] decryptedAesKeyBytes = decryptRSAWithOAEPBytes(encryptedAesKeyBytes, rsaPrivateKey);
            // AES 키 객체 생성 (256비트 = 32바이트)
            SecretKey aesKey = new SecretKeySpec(decryptedAesKeyBytes, 0, decryptedAesKeyBytes.length, "AES");

            // 3. Base64 디코딩된 IV 준비 및 길이 검증
            byte[] ivBytes = Base64.getDecoder().decode(ivBase64);
            if (ivBytes.length != GCM_IV_LENGTH_BYTE) {
                throw new IllegalArgumentException(
                        "Invalid IV length: required " + GCM_IV_LENGTH_BYTE + " bytes for AES-GCM.");
            }
            // GCMParameterSpec 생성 (인증 태그 길이 비트, IV 바이트 배열)
            GCMParameterSpec gcmParamSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BIT, ivBytes);

            // 4. AES-GCM으로 실제 데이터 복호화
            Cipher aesCipher = Cipher.getInstance("AES/GCM/NoPadding"); // 알고리즘 변경
            aesCipher.init(Cipher.DECRYPT_MODE, aesKey, gcmParamSpec); // 파라미터 스펙 변경

            byte[] encryptedDataBytes = Base64.getDecoder().decode(encryptedDataBase64); // 암호문+태그
            // doFinal 호출 시 태그 자동 검증
            byte[] decryptedDataBytes = aesCipher.doFinal(encryptedDataBytes);

            // 5. 최종 결과 반환
            return new String(decryptedDataBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            // AEADBadTagException (인증 태그 검증 실패) 등 구체적인 예외 처리 가능
            logger.error("Error during AES-GCM hybrid decryption for userNo {}: {}", userNo, e.getMessage(), e);
            throw new RuntimeException("AES-GCM 하이브리드 복호화 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * RSA-OAEP를 사용하여 바이트 배열 복호화 (내부 헬퍼)
     * 
     * @param encryptedBytes 암호화된 바이트 배열
     * @param privateKey     RSA 개인키
     * @return 복호화된 바이트 배열
     */
    private byte[] decryptRSAWithOAEPBytes(byte[] encryptedBytes, PrivateKey privateKey) {
        try {
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            cipher.init(Cipher.DECRYPT_MODE, privateKey,
                    new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));
            return cipher.doFinal(encryptedBytes);
        } catch (Exception e) {
            logger.error("Error decrypting bytes with RSA-OAEP", e);
            // decryptRSAWithOAEP와의 일관성을 위해 RuntimeException 발생시키거나, 호출하는 쪽에서 처리하도록 수정 가능
            throw new RuntimeException("RSA-OAEP 바이트 복호화 중 오류", e);
        }
    }

// 역방향 암호화
    // public List<Map<String, Object>> reverseEncrypt(List<Map<String, Object>> paramList) {
    //     List<Map<String, Object>> resultList = new ArrayList<>();
    //     // SswRequestSqlDTO userInfoDto = new SswRequestSqlDTO();
    //     // List<SswRequestSqlDTO> userDtoList = new ArrayList<>();
    //     // userDtoList.add(userInfoDto);
    //     try {
    //         for (Map<String, Object> param : paramList) {
    //             String userNo = String.valueOf(param.get("user_no"));
    //             String workUserNo = String.valueOf(param.get("work_user_no"));
    //             String encryptKey = String.valueOf(param.get("encpt_key"));
    //             // SswResponseDTO userResponse = sswService.ssw0002(userDtoList, false);
    //             // 하이브리드 암호화 요소 추출
    //             String encryptedDataBase64 = String.valueOf(param.get("encryptedData"));
    //             String encryptedAesKeyBase64 = String.valueOf(param.get("encryptedAesKey"));
    //             String ivBase64 = String.valueOf(param.get("iv"));
                
    //             // 1. user_no의 개인키 로드
    //             String userPrivateKeyPem = extractKeyFromSsw(userNo, "hrs_prvt_key_get", "ret_prvtkey");
    //             PrivateKey userPrivateKey = getPrivateKeyFromString(userPrivateKeyPem);
                
    //             // 2. AES 키만 복호화 (평문 데이터는 복호화하지 않음)
    //             byte[] encryptedAesKeyBytes = Base64.getDecoder().decode(encryptedAesKeyBase64);
    //             byte[] decryptedAesKeyBytes = decryptRSAWithOAEPBytes(encryptedAesKeyBytes, userPrivateKey);
                
    //             // 3. work_user_no의 공개키 + 개인키 조회
    //             String workPrivateKeyPem = extractKeyFromSsw(workUserNo, "hrs_prvt_key_get", "ret_prvtkey");
    //             String workPublicKeyPem = extractKeyFromSsw(workUserNo, "hrs_pblcn_get", "ret_pblcnkey");
                
    //             // 4. AES 키를 work_user_no의 공개키로 재암호화
    //             PublicKey workPublicKey = getPublicKeyFromString(workPublicKeyPem);
    //             byte[] reEncryptedAesKeyBytes = encryptBytesWithPublicKey(decryptedAesKeyBytes, workPublicKey);
    //             String reEncryptedAesKeyBase64 = Base64.getEncoder().encodeToString(reEncryptedAesKeyBytes);
                
    //             // 5. 결과 저장 - 원본 암호화 데이터와 IV는 그대로 유지, AES 키만 재암호화
    //             Map<String, Object> resultItem = new HashMap<>();
    //             resultItem.put("iv", ivBase64);  // 원본 IV
    //             resultItem.put("encryptedData", encryptedDataBase64);  // 원본 암호화 데이터
    //             resultItem.put("encryptedAesKey", reEncryptedAesKeyBase64);  // 재암호화된 AES 키
    //             if (workPrivateKeyPem != null && workPrivateKeyPem.contains("PrvtKey Content:")) {
    //                 workPrivateKeyPem = workPrivateKeyPem.substring(workPrivateKeyPem.indexOf("-----BEGIN"));
    //             }
    //             resultItem.put("work_user_prvtkey", workPrivateKeyPem);  // 복호화용 개인키
    //             resultList.add(resultItem);
    //         }
            
    //         return resultList;
    //     } catch (Exception e) {
    //         logger.error("reverseEncrypt 처리 중 오류", e);
    //         throw new RuntimeException("암복호화 처리 중 오류 발생", e);
    //     }
    // }

    public List<Map<String, Object>> reverseEncrypt(List<Map<String, Object>> paramList) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        
        try {
            for (Map<String, Object> param : paramList) {
                String userNo = String.valueOf(param.get("user_no"));
                String workUserNo = String.valueOf(param.get("work_user_no"));
                String trgt_key = String.valueOf(param.get("trgt_key"));
                
                // 1. SQL 쿼리 구성 및 실행
                SswRequestSqlDTO requestDto = new SswRequestSqlDTO();
                requestDto.setSqlId("hrs_login01");
                requestDto.setSql_key("hrs_authrt_dlgt_prvt_key_get");
                
                List<Map<String, Object>> sqlParamList = new ArrayList<>();
                Map<String, Object> paramMap = new HashMap<>();
                paramMap.put("trgt_key", trgt_key);
                paramMap.put("trgt_user_no", userNo);
                paramMap.put("work_user_no", workUserNo);
                sqlParamList.add(paramMap);
                requestDto.setParams(sqlParamList);
                
                List<SswRequestSqlDTO> dtoList = new ArrayList<>();
                dtoList.add(requestDto);
                
                SswResponseDTO response = sswService.ssw0002(dtoList, false);
                if (response.getResData() == null || response.getResData().isEmpty()) {
                    throw new RuntimeException("쿼리 결과가 비어 있습니다. trgt_key: " + trgt_key);
                }
                
                // 2. SQL 응답에서 암호화 데이터 가져오기 (해당 부분을 간소화)
                Object dataObj = response.getResData().get(0).getData().get(0);
                Map<String, Object> dataMap = (Map<String, Object>) dataObj;
                Map<String, Object> authrtMap = (Map<String, Object>) dataMap.get("saaswin_hrs_authrt_dlgt_prvt_key_get");
                Map<String, Object> pubkeyMap = (Map<String, Object>) authrtMap.get("ret_pubkey");
                Map<String, Object> encryptedMap = (Map<String, Object>) pubkeyMap.get(trgt_key);
                
                // 3. work_user_no의 개인키 조회
                String workPrivateKeyPem = extractKeyFromSsw(workUserNo, "hrs_prvt_key_get", "ret_prvtkey");
                
                // 4. 결과 저장 - 암호화된 데이터는 그대로 유지
                Map<String, Object> resultItem = new HashMap<>();
                resultItem.put("iv", encryptedMap.get("iv"));
                resultItem.put("encryptedData", encryptedMap.get("encryptedData"));
                resultItem.put("encryptedAesKey", encryptedMap.get("encryptedAesKey"));
                
                // 개인키 접두사 제거
                if (workPrivateKeyPem != null && workPrivateKeyPem.contains("PrvtKey Content:")) {
                    workPrivateKeyPem = workPrivateKeyPem.substring(workPrivateKeyPem.indexOf("-----BEGIN"));
                }
                resultItem.put("work_user_prvtkey", workPrivateKeyPem);
                resultItem.put("work_user_no", workUserNo);
                
                resultList.add(resultItem);
            }
            
            return resultList;
        } catch (Exception e) {
            logger.error("reverseEncrypt 처리 중 오류", e);
            throw new RuntimeException("암복호화 처리 중 오류 발생", e);
        }
    }
    
    // 응답에서 암호화된 정보를 추출하는 메서드
    private Map<String, Object> extractEncryptedInfo(SswResponseDTO response, String encptKey) {
        try {
            // 중첩된 구조에서 데이터 추출
            Object dataObj = response.getResData().get(0).getData().get(0);
            
            if (dataObj instanceof Map<?, ?>) {
                @SuppressWarnings("unchecked")
                Map<String, Object> dataMap = (Map<String, Object>) dataObj;
                
                // "saaswin_hrs_authrt_dlgt_prvt_key_get" 객체 추출
                Object authrtObj = dataMap.get("saaswin_hrs_authrt_dlgt_prvt_key_get");
                if (authrtObj instanceof Map<?, ?>) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> authrtMap = (Map<String, Object>) authrtObj;
                    
                    // "ret_pubkey" 객체 추출
                    Object pubkeyObj = authrtMap.get("ret_pubkey");
                    if (pubkeyObj instanceof Map<?, ?>) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> pubkeyMap = (Map<String, Object>) pubkeyObj;
                        
                        // encptKey (예: "encrypt_rrNo") 객체 추출
                        Object encryptedObj = pubkeyMap.get(encptKey);
                        if (encryptedObj instanceof Map<?, ?>) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> encryptedMap = (Map<String, Object>) encryptedObj;
                            
                            // 암호화된 데이터 정보를 Map으로 반환
                            return encryptedMap;
                        }
                    }
                }
            }
            
            throw new RuntimeException("응답에서 암호화 정보를 찾을 수 없습니다: " + encptKey);
        } catch (Exception e) {
            logger.error("암호화 정보 추출 중 오류: {}", e.getMessage(), e);
            throw new RuntimeException("암호화 정보 추출 중 오류", e);
        }
    }
    

    // 바이트 배열을 공개키로 암호화하는 새로운 메서드 추가
    private byte[] encryptBytesWithPublicKey(byte[] plainBytes, PublicKey publicKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey,
                new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));
        return cipher.doFinal(plainBytes);
    }

    // work_user_no의 공개키 및 개인키 획득
    private String extractKeyFromSsw(String userNo, String sqlKey, String keyName) throws ParseException {
        // ret_pblcnkey인 경우 다른 쿼리 실행
        if ("ret_pblcnkey".equals(keyName)) {
            // 1단계: 사용자 정보 조회 (hrs_com01, hrs_user_get)
            SswRequestSqlDTO userInfoDto = new SswRequestSqlDTO();
            userInfoDto.setSqlId("hrs_com01");
            userInfoDto.setSql_key("hrs_user_get");
            
            List<Map<String, Object>> userParamList = new ArrayList<>();
            Map<String, Object> userParamMap = new HashMap<>();
            userParamMap.put("user_no", userNo);  // user_no로 파라미터 설정
            userParamList.add(userParamMap);
            userInfoDto.setParams(userParamList);
            
            List<SswRequestSqlDTO> userDtoList = new ArrayList<>();
            userDtoList.add(userInfoDto);
            
            SswResponseDTO userResponse = sswService.ssw0002(userDtoList, false);
            if (userResponse.getResData() == null || userResponse.getResData().isEmpty()) {
                throw new RuntimeException("사용자 정보 조회 결과가 비어 있습니다. userNo: " + userNo);
            }
            try {
                // 응답 데이터에서 pblcn_key 추출
                Object userDataObj = userResponse.getResData().get(0)
                        .getData().get(0);
                
                if (userDataObj instanceof Map<?, ?>) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> userDataMap = (Map<String, Object>) userDataObj;
                    
                    // 공개키 반환
                    String publicKey = (String) userDataMap.get("pblcn_key");
                    if (publicKey != null) {
                        return publicKey;
                    }
                    
                    // 추가 처리 (user_id 기반 개인키 조회 등이 필요한 경우)
                    String userId = (String) userDataMap.get("user_id");
                    if (userId != null) {
                        // 필요시 userId를 사용하여 추가 쿼리 실행
                        logger.debug("사용자 ID로 추가 조회: {}", userId);
                    }
                    
                    throw new RuntimeException("공개키(pblcn_key)를 찾을 수 없습니다. userNo: " + userNo);
                } else {
                    throw new RuntimeException("사용자 데이터 형식이 Map이 아닙니다. 확인 필요");
                }
            } catch (Exception e) {
                throw new RuntimeException("공개키 추출 중 오류 발생 - userNo: " + userNo, e);
            }
        } else {
            // 디버깅: 실제 DTO 내용 확인
            System.out.println("=== DTO 디버깅 ===");
            System.out.println("sqlKey: " + sqlKey);
            System.out.println("userNo: " + userNo);
            System.out.println("==================");

            // 기존 코드: ret_prvtkey 또는 다른 키 이름에 대한 처리
            SswRequestSqlDTO dto = new SswRequestSqlDTO();
            dto.setSqlId("hrs_login01");
            dto.setSql_key(sqlKey);
            
            List<Map<String, Object>> sqlParamList = new ArrayList<>();
            Map<String, Object> paramMap = new HashMap<>();
            paramMap.put("work_user_no", userNo);
            paramMap.put("user_no", userNo);
            sqlParamList.add(paramMap);
            dto.setParams(sqlParamList);
            
            List<SswRequestSqlDTO> dtoList = new ArrayList<>();
            dtoList.add(dto);
            
            SswResponseDTO response = sswService.ssw0002(dtoList, false);
            if (response.getResData() == null || response.getResData().isEmpty()) {
                throw new RuntimeException("쿼리 결과가 비어 있습니다. userNo: " + userNo + ", sqlKey: " + sqlKey);
            }
            
            try {
                // 디버깅용 로그 추가
                System.out.println("resData: " + response.getResData());
                System.out.println("getData(): " + response.getResData().get(0).getData());
            
                // 직접 첫 번째 데이터 항목의 "data" 키에 접근
                Object dataObj = response.getResData().get(0).getData().get(0).get("data");
                
                if (dataObj instanceof Map<?, ?>) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dataMap = (Map<String, Object>) dataObj;
                    
                    // 최종 키값 직접 반환 (data.data가 아닌 data에서 바로)
                    return (String) dataMap.get(keyName);  // keyName = "ret_prvtkey" 등
                } else {
                    throw new RuntimeException("[data] 항목이 Map 형식이 아닙니다. 확인 필요");
                }
            } catch (Exception e) {
                throw new RuntimeException("[" + keyName + "] 키 추출 중 오류 발생 - userNo: " + userNo, e);
            }
        }
    }

}