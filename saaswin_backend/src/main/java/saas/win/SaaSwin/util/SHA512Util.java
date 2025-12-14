package saas.win.SaaSwin.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class SHA512Util {

    /**
     * 주어진 문자열을 SHA-512 알고리즘으로 해싱하여 반환
     *
     * @param input 해싱할 문자열
     * @return SHA-512 해시값 (16진수 문자열)
     */
    public static String hashSHA512(String input) {
        if (input == null) {
            throw new IllegalArgumentException("입력값이 null일 수 없습니다.");
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] hashBytes = digest.digest(input.getBytes());

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }

            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-512 해싱 오류 발생", e);
        }
    }
}
