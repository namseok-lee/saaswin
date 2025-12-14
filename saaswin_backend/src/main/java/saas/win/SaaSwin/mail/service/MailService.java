package saas.win.SaaSwin.mail.service;

import jakarta.mail.Address;
import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.SqlConstants;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.mail.dto.MailDTO;
import saas.win.SaaSwin.sql.command.service.SqlService;
import saas.win.SaaSwin.ssw.dto.request.SswRequestSqlDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RequiredArgsConstructor
@Service
@Slf4j
public class MailService {

    private SqlService sqlService;

    @Value("${mail.host}")
    private String mailHost;
    @Value("${mail.port}")
    private int mailPort;

    public SswResponseDTO sendMail(@RequestBody MailDTO mailDTO) throws ParseException {

        SswResponseDTO res = new SswResponseDTO();
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
//        mailSender.setUsername("hkko@win.co.kr");
//        mailSender.setPassword("win1234");

        // 템플릿 검색해서 메일 세팅
//        SswRequestSqlDTO sqlDto = new SswRequestSqlDTO();
//        sqlDto.setSqlId(SqlConstants.REDIS_SQL_MAIL_01);
//        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
//        Map<String, Object> param = new HashMap<String, Object>();
//        param.put("nt_tmplt_no", mailDTO.getTmplt_no());
//        param.put(SqlConstants.REDIS_SQL_KEY, SqlConstants.REDIS_SQL_MAIL_01);
//        params.add(param);
//        sqlDto.setParams(params);
//        List<Map<String, Object>> template = sqlService.executeQuery_select_for_func(sqlDto);

        String eml_ttl = "행운의편지 ,,,,,,";        // 메일제목
        String eml_cn = "<h2>집에가고싶당 ,,,,,,, 🐹😥</h2><br><br><br><p>메일 테스트 중 . . . . . ..</p><br><br><h3>오늘 저녁은 ,,, 치킨 ,,,,</h3>";         // 메일내용
        Map<String, String> failedRecipients = new HashMap<>(); //실패수신자 + 이유 목록

//        for (Map<String, Object> tem : template) {
//            eml_ttl = String.valueOf(tem.get("eml_ttl"));
//            eml_cn = String.valueOf(tem.get("eml_cn"));
//        }

        // 예외 발생 시 레디스에 insert
        try{
            MimeMessage message = mailSender.createMimeMessage();       // 이메일내용, 제목, 수신자, 첨부파일 등 추가

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(mailDTO.getRcvr_eml_addr().toArray(new String[0]));
            helper.setSubject(eml_ttl);;
            helper.setText(eml_cn, true);        // 메일 내용을 html로 인식시키려면 2번째 파라미터로 true 보내기
            helper.setFrom(mailDTO.getSndpty_eml_addr());
            helper.setCc("hkko@win.co.kr");     // 참조자
            helper.setBcc("hkko@win.co.kr");    // 숨은참조자

            mailSender.send(message);

            res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
            res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);
            
            // 발송 완료 시 메일마스터 테이블에도 넣기
        } catch (MailSendException e) {
            if (e.getFailedMessages() != null) {
                for (Map.Entry<Object, Exception> entry : e.getFailedMessages().entrySet()) {
                    Object failedObject = entry.getKey();  // 실패한 객체
                    Exception failedException = entry.getValue(); // 실패한 예외

                    if (failedObject instanceof MimeMessage) {
                        try {
                            MimeMessage failedMessage = (MimeMessage) failedObject;
                            Address[] failedAddresses = failedMessage.getAllRecipients();

                            if (failedAddresses != null) {
                                for (Address address : failedAddresses) {
                                    failedRecipients.put(address.toString(), failedException.getMessage());
                                    System.err.println("❌ 메일 전송 실패: " + address + " - 이유: " + failedException.getMessage());
                                }
                            }
                        } catch (MessagingException ex) {
                            System.err.println("❌ 실패한 이메일을 분석하는 중 오류 발생: " + ex.getMessage());
                        }
                    }
                }
            }
//            return "❌ SMTP 서버에서 메일 전송을 거부했습니다.";
        } catch (AuthenticationFailedException e) {
//            return "❌ 인증 실패: SMTP 사용자 이름 또는 비밀번호가 잘못되었습니다.";
        } catch (SendFailedException e) {
            for (Address address : e.getInvalidAddresses()) {
                failedRecipients.put(address.toString(), "SMTP 인증 실패: " + e.getMessage());
            }
//            return "❌ 수신자 주소가 잘못되었습니다.";
        } catch (MessagingException e) {
//            return "❌ 메일 전송 중 알 수 없는 오류가 발생했습니다: " + e.getMessage();
        } catch (MailException e) {
//            return "❌ Spring Mail 오류: " + e.getMessage();
        }


        return res;

    }



}
