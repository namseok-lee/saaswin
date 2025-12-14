package saas.win.SaaSwin.util;

import java.security.SecureRandom;

public class PasswordGenerator {
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    /**
     * 지정된 길이의 랜덤 비밀번호 생성
     * PostgreSQL 함수와 동일한 문자셋 사용
     * 
     * @param length 비밀번호 길이
     * @return 랜덤 비밀번호
     */
    public static String generateRandomPassword(int length) {
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return password.toString();
    }
    
    /**
     * 비밀번호와 해시를 함께 생성
     * 
     * @param length 비밀번호 길이
     * @return 비밀번호 정보 객체
     */
    public static PasswordInfo generatePasswordInfo(int length) {
        String rawText = generateRandomPassword(length);
        String sha512Hash = SHA512Util.hashSHA512(rawText);
        return new PasswordInfo(rawText, sha512Hash);
    }
    
    /**
     * 18자리 비밀번호와 해시를 함께 생성 (기본값)
     * 
     * @return 비밀번호 정보 객체
     */
    public static PasswordInfo generatePasswordInfo() {
        return generatePasswordInfo(18);
    }
    
    /**
     * 비밀번호 정보를 담는 클래스
     */
    public static class PasswordInfo {
        private final String rawText;
        private final String sha512Hash;
        
        public PasswordInfo(String rawText, String sha512Hash) {
            this.rawText = rawText;
            this.sha512Hash = sha512Hash;
        }
        
        public String getRawText() { 
            return rawText; 
        }
        
        public String getSha512Hash() { 
            return sha512Hash; 
        }
    }
}