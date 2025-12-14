package saas.win.SaaSwin.Constants;

public class AligoConstants {

    // 알림톡을 보내는 메시지
    public static final String RESULT_MSG = "";

    public static final String SNDR_API = "tpoa3lvwmc3mvowolakl901bi3qfoq5t";
    public static final String SNDR_TELNO = "01038390339";
    public static final String SNDR_ID = "whiteinfo";
    public static final String SNDR_PROFILE = "87dbbb7c3b2f9f482b0556163e6250bfb5edf691";

    // 톡 전송 URL
    public static final String SNDR_SEND_URL = "https://kakaoapi.aligo.in/akv10/alimtalk/send/";
    // 톡 전송 상세 내용 URL
    public static final String SNDR_DETAIL_URL = "https://kakaoapi.aligo.in/akv10/history/detail/";
    // 톡 전송 실패시 SMS발송 확인 URL
    public static final String SNDR_SMS_SEND_URL ="https://apis.aligo.in/sms_list/";

    // 파라미터 type
    public static final String SNDR_TYPE_CLIENT = "client"; // 파라미터로 받은값을 그대로 넣음
    public static final String SNDR_TYPE_USER_NAME = "user_ut"; // user_no를 받아 이름으로 넣음
    public static final String SNDR_TYPE_JOBS_NAME = "jbps_nm"; // user_no를 받아 현재 직급으로 넣음
}
