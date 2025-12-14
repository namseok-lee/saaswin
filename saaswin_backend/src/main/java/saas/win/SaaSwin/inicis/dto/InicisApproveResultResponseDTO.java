package saas.win.SaaSwin.inicis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 승인결과 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InicisApproveResultResponseDTO {
    
    // 공통
    private String resultCode;
    private String resultMsg;
    private String tid;
    private String mid;
    private String MOID;
    private String TotPrice;
    private String goodName;
    private String payMethod;
    private String applDate;
    private String applTime;
    private String EventCode;
    private String buyerName;
    private String buyerTel;
    private String buyerEmail;
    private String custEmail;


    // 신용카드
    private String applNum;
    private String CARD_Num;
    private String CARD_Interest;
    private String CARD_Quta;
    private String CARD_Code;
    private String CARD_CoprFlag;
    private String CARD_CheckFlag;
    private String CARD_PRTD_CODE;
    private String CARD_BankCode;
    private String CARD_SrcCode;
    private String CARD_Point;
    private String CARD_UsePoint;
    private String CARD_ApplPirce;
    private String CARD_CouponPrice;
    private String CARD_CouponDiscount;
    private String NAVERPOINT_UserFreePoint;
    private String NAVERPOINT_CSHRApplYN;
    private String NACERPOINT_CSHRApplAmt;
    private String PCO_OrderNo;
    private String currency;
    private String OrgPrice;


    // 계좌이체/가상계좌/휴대폰
}
