package saas.win.SaaSwin.util;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.client.Request;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.RestClient;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class ElasticsearchIndexManagerUtil {

    private final ElasticsearchClient elasticsearchClient;
    private final RestClient restClient; // Low-level 클라이언트 추가 필요
    private static final String MAPPING_DIR = "elastic/";

    public void ensureIndexExists(String indexName) throws IOException {
        boolean exists = elasticsearchClient.indices()
                .exists(e -> e.index(indexName)).value();

        if (!exists) {
            String path = MAPPING_DIR + indexName + "_mapping.json";
            ClassPathResource resource = new ClassPathResource(path);

            if (!resource.exists()) {
                throw new FileNotFoundException("❌ 매핑 파일 없음: " + path);
            }

            String mappingJson = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            Request request = new Request("PUT", "/" + indexName);
            request.setJsonEntity(mappingJson);

            Response response = restClient.performRequest(request);

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode >= 200 && statusCode < 300) {
                System.out.println("✅ 인덱스 생성 완료: " + indexName);
            } else {
                throw new IOException("❌ 인덱스 생성 실패: " + indexName + " (" + statusCode + ")");
            }
        }
    }
}