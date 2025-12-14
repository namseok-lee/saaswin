package saas.win.SaaSwin.login.myInfo.dto;

import lombok.Data;

@Data
public class MyInfoResponseDTO {
    private String user_id;
    private String telNo;
    private String lastChangePassword;
    private String expireDate;
    private String user_name;

}
