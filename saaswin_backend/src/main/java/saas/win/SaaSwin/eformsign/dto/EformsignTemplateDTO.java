package saas.win.SaaSwin.eformsign.dto;

import lombok.Data;

import java.util.Map;

@Data
public class EformsignTemplateDTO {

    private String work_user_no;
    private String scr_no;
    private String scr_prord;
    private String rprs_ognz_no;
    private Map<String, Object> template_info; // template_id , template_name


    // efs의 member_id
    private String member_id;

    // token에서 받아옴
    private String access_token;
    private String refresh_token;
    private String api_url; // 해당토큰으로 사용할 api 주소 ( https://kr-api.eformsign.com )

    // 실제 호출할 url 주소 . api_url + call_api_url 할 시, full url이 나옴.
    private String call_api_url; // ( /v2.0/api/template_image/#{data1} )

    private String template_id;
    private String form_imgae_id;

    private String user_no;
    //private String rprs_ognz_no;

    private Map<String, Object> param;
}
