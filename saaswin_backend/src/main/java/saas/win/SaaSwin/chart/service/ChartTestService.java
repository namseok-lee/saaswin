package saas.win.SaaSwin.chart.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch.core.GetResponse;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.UpdateRequest;
import co.elastic.clients.elasticsearch.core.search.Hit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import saas.win.SaaSwin.chart.document.ChartTestDocument;
import saas.win.SaaSwin.util.ElasticsearchIndexManagerUtil;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ChartTestService {

    private final ElasticsearchClient elasticsearchClient;
    private final ElasticsearchIndexManagerUtil indexManager;
    private static final String INDEX_NAME = "chart-test";

    // 차트 조회
    public List<ChartTestDocument> searchTestChart(Map<String, Object> param) throws IOException {
        List<Map<String, Object>> params = (List<Map<String, Object>>) param.get("params");
        Map<String, Object> filter = params.get(0);
    
        String rprsOgnzNo = String.valueOf(filter.get("rprs_ognz_no"));
        Object chartKeyObj = filter.get("chart_key");
    
        SearchResponse<ChartTestDocument> response = elasticsearchClient.search(s -> s
            .index(INDEX_NAME)
            .query(q -> q
                .bool(b -> {
                    b.must(m -> m
                        .term(t -> t
                            .field("rprs_ognz_no.keyword")
                            .value(rprsOgnzNo)
                        )
                    );

                    if (chartKeyObj != null) {
                        String chartKey = String.valueOf(chartKeyObj);
                        if (!chartKey.isEmpty()) {
                            b.must(m -> m
                                .term(t -> t
                                    .field("chart_key.keyword")
                                    .value(chartKey)
                                )
                            );
                        }
                    }

                    return b;
                })
            )
            .sort(srt -> srt
                .field(f -> f
                    .field("seq.keyword") // 여기!
                    .order(SortOrder.Asc)
                )
            ),
            ChartTestDocument.class
        );
    
        return response.hits().hits()
            .stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }


    // 차트 찾기
    public ChartTestDocument searchTestChartById(String id) throws IOException {
        GetResponse<ChartTestDocument> response = elasticsearchClient.get(g -> g
                        .index(INDEX_NAME)
                        .id(id),
                ChartTestDocument.class
        );

        if (response.found()) {
            return response.source();
        } else {
            throw new NoSuchElementException("Document not found with id: " + id);
        }
    }
    // 차트 생성
    public void saveChartTest(ChartTestDocument doc) throws IOException {
        // ID가 없으면 UUID로 자동 생성
        if (doc.getId() == null || doc.getId().isBlank()) {
            doc.setId(UUID.randomUUID().toString());
        }
        // 현재 timestamp 자동 설정
        doc.setTimestamp(Instant.now().toString());
        // 인덱스 없으면 생성
        indexManager.ensureIndexExists(INDEX_NAME); // 자동 생성 핵심
        elasticsearchClient.index(i -> i
                .index(INDEX_NAME)
                .id(doc.getId())
                .document(doc)
        );
    }

    // 차트 데이터 수정
    public void updateDocument( String id, Map<String, Object> fieldsToUpdate) throws IOException {
        UpdateRequest<Map<String, Object>, Map<String, Object>> updateRequest =
            UpdateRequest.of(u -> u
                .index(INDEX_NAME)
                .id(id)
                .doc(fieldsToUpdate)
            );

        elasticsearchClient.update(updateRequest, Map.class);
    }
        
    // 차트 삭제
    public void deleteById(String id) throws IOException {
        elasticsearchClient.deleteByQuery(d -> d
                .index(INDEX_NAME)
                .query(q -> q
                        .term(t -> t
                                .field("id")
                                .value(v -> v.stringValue(id))
                        )
                )
        );
    }
}
