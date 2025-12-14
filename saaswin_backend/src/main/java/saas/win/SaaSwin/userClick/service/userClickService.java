package saas.win.SaaSwin.userClick.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;

import java.util.HashMap;
import java.util.Map;




@Service
@RequiredArgsConstructor
public class userClickService {


    private final ElasticsearchClient elasticsearchClient;

    // 클릭 로그 저장
    public void saveClickLog(Map<String, String> dto) {
        try {
            dto.replaceAll((key, value) -> value == null ? "" : value);
            String rprsOgnzNo = dto.getOrDefault("rprsOgnzNo", "default").toLowerCase();
            String indexName = "saaswin_user_click_" + rprsOgnzNo;


            // 인덱스 존재 여부 확인
            boolean exists = elasticsearchClient.indices().exists(b -> b.index(indexName)).value();

            if (!exists) {
                // 매핑 정의
                Map<String, Property> properties = new HashMap<>();
                properties.put("os", Property.of(p -> p.keyword(k -> k)));
                properties.put("browser", Property.of(p -> p.keyword(k -> k)));
                properties.put("buttonText", Property.of(p -> p.keyword(k -> k)));
                properties.put("menu", Property.of(p -> p.keyword(k -> k)));
                properties.put("userNo", Property.of(p -> p.keyword(k -> k)));
                properties.put("rprsOgnzNo", Property.of(p -> p.keyword(k -> k)));
                properties.put("ipv4", Property.of(p -> p.ip(ip -> ip)));
                properties.put("ipv6", Property.of(p -> p.ip(ip -> ip)));
                properties.put("dt", Property.of(p -> p.date(d -> d)));

                // 인덱스 생성
                elasticsearchClient.indices().create(c -> c
                    .index(indexName)
                    .mappings(m -> m.properties(properties))
                    .settings(s -> s
                        .numberOfShards("1")
                        .numberOfReplicas("1")
                    )
                );
            }

            // 1. 문서 저장 요청 생성
            IndexRequest<Map<String, String>> request = IndexRequest.of(i -> i
                .index(indexName)
                .document(dto)
            );

            // 2. Elasticsearch에 문서 저장 실행
            elasticsearchClient.index(request);


        } catch (IOException e) {
            System.err.println("Elasticsearch 저장 실패: " + e.getMessage());
        }
    }
    // 클릭 로그 삭제
    public void deleteClickLogById(String indexName, String id) {
        try {
            elasticsearchClient.delete(d -> d
                .index(indexName)   // 예: saaswin_user_click_win
                .id(id)             // 예: XoEiuZYBhjysd-3BmjO4
            );
            System.out.println("삭제 완료: " + id);
        } catch (IOException e) {
            System.err.println("문서 삭제 실패: " + e.getMessage());
        }
    }
}
