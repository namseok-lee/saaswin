package saas.win.SaaSwin.chart.document;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Document(indexName = "chart-test")
public class ChartTestDocument {
    @Id
    private String id;
    @Field(type = FieldType.Date, store = false)
    private String timestamp;  
    private String rprs_ognz_no; // 조직 번호
    private String title; // 차트 제목
    private String seq; // 차트 순서
    private String description; // 차트 설목
    private String description_sub; // 차트 설목 부분
    private String default_type;    // 기본 차트 타입
    private String chart_key; // 차트 키
    private List<Map<String, Object>> Data; // 차트 데이터
}
