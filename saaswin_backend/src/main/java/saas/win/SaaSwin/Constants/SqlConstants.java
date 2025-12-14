package saas.win.SaaSwin.Constants;

public class SqlConstants {

    /* 화면 오브젝트 */
    public static final int OBJECT_SEARCH_SQL_ID_01 = 1; // 컬럼정보
    public static final int OBJECT_SEARCH_SQL_ID_02 = 2; // 화면 데이터
    public static final int OBJECT_SEARCH_SQL_ID_03 = 3; // 하위 화면 데이터(그리드)
    public static final int OBJECT_SEARCH_SQL_ID_66 = 66; // 하위 화면 데이터(테이블)
    public static final int OBJECT_SEARCH_SQL_ID_04 = 27; // 권한별 화면번호 데이터

    /* CRUD */
    public static final int SEARCH_SQL_ID_01 = 3; // 공통 조회
    public static final int SEARCH_SQL_ID_02 = 3; // 공통 조회
    public static final int CUD_SQL_ID_01 = 15; // 공통 CUD
    public static final String CUD_SQL_ID_01_MSG = "rtn_msg"; // 공통 CUD의 return key
    public static final int R_SQL_ID_01 = 19; // 공통 R

    /* redis sql 관련 */
    public static final String REDIS_SQL_KEY = "sql_key";
    public static final String REDIS_SQL_START_WITH = "select saaswin_api_";
    public static final String REDIS_SQL_END_WITH = "((:p_com)::jsonb) as data";
    public static final String REDIS_SQL_LOGIN_01 = "hrs_login01";
    public static final String REDIS_SQL_LOGIN_KEY_01 = "hrs_login_chg_pswd";
    public static final String REDIS_SQL_LOGIN_KEY_02 = "hrs_random_sha512_hash";
    public static final String REDIS_SQL_SCR_01 = "hrs_com01";
    public static final String REDIS_SQL_SCR_KEY_01 = "hrs_user_authrt_scr"; // 화면조회 tsm_scr
    public static final String REDIS_SQL_SCR_KEY_02 = "hrs_dclsf_grid"; // 하단 그리드 조회
    public static final String REDIS_SQL_SCR_KEY_03 = "hrs_dclsf_table"; // 하단 테이블 조회
    public static final String REDIS_SQL_FILE_01 = "hrs_fileserver01";
    public static final String REDIS_SQL_FILE_KEY_01 = "hrs_user_get"; // 유저 정보 조회
    public static final String REDIS_SQL_FILE_KEY_02 = "hrs_file_create"; // 파일등록
    public static final String REDIS_SQL_FILE_KEY_03 = "hrs_file_all"; // 파일조회
    public static final String REDIS_SQL_FILE_KEY_04 = "hrs_file_delete"; // 파일삭제
    // public static final String REDIS_SQL_FILE_KEY_05 = "hrs_file_path"; // 파일경로 조회
    public static final String REDIS_SQL_ALG_01 = "hri_nt01"; // 알리고
    public static final String REDIS_SQL_ALG_KEY_01 = "hri_nt_rslt_create"; // 알리고 송신결과 등록
    public static final String REDIS_SQL_ALG_KEY_02 = "hri_nt_tmplt_get"; // 알리고 템플릿 정보 조회
    public static final String REDIS_SQL_ALG_KEY_03 = "hri_nt_mid_distinct"; // 알리고 발송내역 중복값 체크
    public static final String REDIS_SQL_ALG_KEY_04 = "hri_nt_sndr_create"; // 알리고 전송결과 등록
    public static final String REDIS_SQL_ALG_KEY_05 = "hri_nt_apnt"; // 알리고 발령내역 전송
    public static final String REDIS_SQL_ALG_KEY_06 = "hrs_pswd_reset_cert_pblcn"; // 알리고 전송
    public static final String REDIS_SQL_ALG_KEY_07 = "hrs_pswd_reset_cert_idnty"; // 알리고 검증
    public static final String REDIS_SQL_MAIL_01 = "hri_nt01"; // 메일
    public static final String REDIS_SQL_MAIL_KEY_01 = "hri_nt_rslt_create";
    public static final String REDIS_SQL_LNG_01 = "hrs_com01"; // 다국어
    public static final String REDIS_SQL_LNG_KEY_01 = "redis_dd_select"; // 다국어 조회
    public static final String REDIS_SQL_LNG_KEY_02 = "saaswin_redis_getval_jsonb"; // 다국어 버전조회
    public static final String REDIS_SQL_ATRZ_01 = "hrs_com01"; // 결재 테이블 관련
    public static final String REDIS_SQL_ATRZ_KEY_01 = "hrs_atrz_search"; // 결재 테이블 정보 조회
    public static final String REDIS_SQL_ATRZ_KEY_02 = "hrs_atrz_insert"; // 결재 테이블 데이터 삽입
    public static final String REDIS_SQL_ATRZ_KEY_03 = "hrs_atrz_update"; // 결재 테이블 데이터 수정
    public static final String REDIS_SQL_ATRZ_KEY_04 = "hrs_atrz_delete"; // 결재 테이블 데이터 삭제
    public static final String REDIS_SQL_SSO_KEY_01 = "hrs_login_user_select"; // SSO 사용자 조회
    public static final String REDIS_SQL_INVTN_01 = "hpr_invtn01"; // 초대관리
    public static final String REDIS_SQL_INVTN_KEY_01 = "hpr_invtn_trpr_grid_cud"; // 초대관리 CUD
    public static final String REDIS_SQL_APNT_01 = "hpo_apnt01"; // 발령관리
    public static final String REDIS_SQL_APNT_KEY_01 = "hpo_array_info_get"; // 발령관리 CUD

    /* 공통코드 */
    public static final String COMMON_CODE_TELNO = "hrs_group00770_cm0001"; // 휴대폰번호

    /* 파일 */
    public static final int R_FILE_SQL_ID_01 = 20; // file서버 fileid로 file데이터 조회
    public static final int R_FILE_SQL_ID_02 = 21; // file서버 user_no로 회사번호 찾기
    public static final int R_FILE_SQL_ID_03 = 22; // file서버 파일저장하기
    public static final int R_FILE_SQL_ID_04 = 23; // file서버 파일삭제하기
    // public static final int R_FILE_SQL_ID_05 = 24; // file서버 파일경로 조회

    /* 로그인 */
    public static final int LOGIN_SQL_ID_01 = 5; // 로그인 임시

    /* 비밀번호 재설정 */
    public static final int PASSWORD_RESET_ID_01 = 75; // 비밀번호 재설정시 유저 정보 검사
    public static final int PASSWORD_RESET_ID_02 = 76; // 비밀번호 초기화
    public static final int PASSWORD_RESET_ID_03 = 77; // 비밀번호 초기화

    /* 다국어 */
    public static final int LANGUAGE_SQL_ID_01 = 24; // 로그인 임시

    /* 알림톡 */
    public static final int ALG_SQL_ID_01 = 26; // 템플릿 검색
    public static final int ALG_SQL_ID_02 = 28; // user검색
    public static final int ALG_SQL_ID_03 = 29; // 상세 전송결과 배치용 select
    public static final int ALG_SQL_ID_04 = 30; // 알리고 톡 전송 insert
    public static final int ALG_SQL_ID_05 = 31; // 알리고 상세내역 insert

    // JSON ssw02 일 경우에 무조건 full json으로 만들어서 줄때의 key명
    public static final String FULL_JSON_DATA = "full_json_data";

    /* SQL PARAM TYPE */
    public static final String VARCHAR = "varchar";
    public static final String VARCHAR2 = "varchar2";
    public static final String VACHAR2 = "vachar2";
    public static final String STRING = "string";
    public static final String DATE = "date";
    public static final String NUMBER = "number";
    public static final String LONG = "long";
    public static final String JSONB = "jsonb";

    /* eformsign */
    public static final int EFS_SQL_ID_01 = 47; // 템플릿 등록 sql

    /* 공통 함수들 호출 시 */
    public static final String COMMON_SQL_SUCCESS_CODE = "40002";
    public static final String COMMON_SQL_NO_DATA_CODE = "40004";

    /* 공통 코드 (redis) */
    public static final int COMMON_CODE_SQL_ID_01 = 59;
    public static final String COMMON_CODE_START_STRING = "cmcd_";
    public static final String COMMON_CODE_COMMON_STRING1 = "COMGRP";
    public static final String COMMON_CODE_SQL = "select saaswin_redis_getval_jsonb(:p_com, 0) as data";
}
