package saas.win.SaaSwin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(
		exclude = {
				org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration.class
		}
)
public class SaaSwinApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaaSwinApplication.class, args);
	}

}
