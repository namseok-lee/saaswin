package saas.win.SaaSwin.encryption.controller;

import saas.win.SaaSwin.encryption.dto.DecryptionRequest;
import saas.win.SaaSwin.encryption.dto.DecryptionResponse;
import saas.win.SaaSwin.encryption.dto.EncryptionRequest;
import saas.win.SaaSwin.encryption.dto.EncryptionResponse;
import saas.win.SaaSwin.encryption.dto.HybridDecryptionRequest;
import saas.win.SaaSwin.encryption.service.RSAEncryptionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.security.spec.MGF1ParameterSpec;

@RestController
@RequestMapping("/{rprsOgnzNo}/api/encryption")
public class EncryptionController {

    private final RSAEncryptionService encryptionService;

    @Autowired
    public EncryptionController(RSAEncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    
    @GetMapping("/keys")
    public ResponseEntity<Map<String, String>> getKeys(@PathVariable("rprsOgnzNo") String rprsOgnzNo) {
        Map<String, String> keys = new HashMap<>();
        keys.put("publicKey", encryptionService.getPublicKeyString());
        keys.put("privateKey", encryptionService.getPrivateKeyString());
        return ResponseEntity.ok(keys);
    }
     
    @PostMapping("/encrypt")
    public ResponseEntity<EncryptionResponse> encrypt(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody EncryptionRequest request) {
        String encryptedText = encryptionService.encrypt(request.getPlainText());
        return ResponseEntity.ok(new EncryptionResponse(encryptedText));
    }
    
    @PostMapping("/decrypt")
    public ResponseEntity<DecryptionResponse> decrypt(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody DecryptionRequest request) {
        String plainText = encryptionService.decrypt(request.getEncryptedText());
        return ResponseEntity.ok(new DecryptionResponse(plainText));
    }
    
    @PostMapping("/encrypt-with-key")
    public ResponseEntity<EncryptionResponse> encryptWithKey(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestBody EncryptionRequest request,
            @RequestParam String publicKey) {
        String encryptedText = encryptionService.encryptWithPublicKey(request.getPlainText(), publicKey);
        return ResponseEntity.ok(new EncryptionResponse(encryptedText));
    }
    
    @PostMapping("/decrypt-with-key")
    public ResponseEntity<DecryptionResponse> decryptWithKey(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestBody DecryptionRequest request,
            @RequestParam String userNo) {
        String plainText = encryptionService.decryptWithRemotePrivateKey(request.getEncryptedText(), userNo);
        return ResponseEntity.ok(new DecryptionResponse(plainText));
    }

    
    /**
     * 하이브리드 암호화된 데이터를 복호화하는 엔드포인트 (AES + RSA)
     */
    @PostMapping("/decrypt-data")
    public ResponseEntity<String> decryptHybridData(
            @PathVariable("rprsOgnzNo") String rprsOgnzNo,
            @RequestBody HybridDecryptionRequest request) {
        try {
            String encryptedData = request.getEncryptedData();
            String encryptedAesKey = request.getEncryptedAesKey();
            String iv = request.getIv();
            String userNo = request.getUserNo();

            if (encryptedData == null || encryptedData.isEmpty() ||
                    encryptedAesKey == null || encryptedAesKey.isEmpty() ||
                    iv == null || iv.isEmpty() ||
                    userNo == null || userNo.isEmpty()) {
                return ResponseEntity.badRequest().body("encryptedData, encryptedAesKey, iv, userNo는 필수입니다.");
            }

            String decryptedText = encryptionService.decryptHybrid(
                    encryptedData,
                    encryptedAesKey,
                    iv,
                    userNo);
            return ResponseEntity.ok(decryptedText);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("하이브리드 복호화 실패: " + e.getMessage());
        }
    }

    @PostMapping("/reverseEncrypt")
    public ResponseEntity<List<Map<String, Object>>> reverseEncrypt(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<Map<String, Object>> paramList) {
        List<Map<String, Object>> result = encryptionService.reverseEncrypt(paramList);
        return ResponseEntity.ok(result);
    }
}