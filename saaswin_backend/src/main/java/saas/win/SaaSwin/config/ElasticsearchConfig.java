package saas.win.SaaSwin.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import org.apache.http.HttpHost;
import org.apache.http.Header;
import org.apache.http.message.BasicHeader;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;
import java.util.Base64;

@Configuration
public class ElasticsearchConfig {
    @Value("${spring.elasticsearch.uris}")
    private String esUri;
    @Value("${spring.elasticsearch.username}")
    private String esUsername;

    @Value("${spring.elasticsearch.password}")
    private String esPassword;

    @Bean
    public RestClient restClient() {
        URI uri = URI.create(esUri);
        String auth = esUsername + ":" + esPassword;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        
        // Base64 인코딩된 인증 정보를 담은 HTTP 헤더 배열 생성
        Header[] defaultHeaders = new Header[]{
            new BasicHeader("Authorization", "Basic " + encodedAuth)
        };
        return RestClient.builder(new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme()))
                .setDefaultHeaders(defaultHeaders)
                .build();
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient) {
        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        return new ElasticsearchClient(transport);
    }
}
