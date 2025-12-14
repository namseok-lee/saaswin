// package saas.win.SaaSwin.config;

// import com.zaxxer.hikari.HikariDataSource;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.boot.context.properties.ConfigurationProperties;
// import org.springframework.boot.jdbc.DataSourceBuilder;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.context.annotation.Primary;
// import org.springframework.jdbc.core.JdbcTemplate;
// import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

// import javax.sql.DataSource;

// /**
//  * 단순화된 단일 데이터베이스 설정
//  * 환경변수 기반으로 DB 연결 정보 관리
//  * 
//  * @author SaaSwin Team
//  */
// @Slf4j
// @Configuration
// public class DatabaseConfig {
    
//     /**
//      * 단일 DataSource 설정 (환경변수 기반)
//      * application.properties의 spring.datasource.* 설정을 자동으로 읽어옴
//      */
//     @Bean
//     @Primary
//     @ConfigurationProperties(prefix = "spring.datasource")
//     public DataSource dataSource() {
//         HikariDataSource dataSource = DataSourceBuilder
//                 .create()
//                 .type(HikariDataSource.class)
//                 .build();
        
//         // Pool 정보 로깅
//         log.info("🔸 [DataSource] 초기화 완료");
//         log.info("🔸 [DataSource] URL: {}", dataSource.getJdbcUrl());
//         log.info("🔸 [DataSource] Username: {}", dataSource.getUsername());
//         log.info("🔸 [DataSource] Pool Name: {}", dataSource.getPoolName());
//         log.info("🔸 [DataSource] Max Pool Size: {}", dataSource.getMaximumPoolSize());
//         log.info("🔸 [DataSource] Min Idle: {}", dataSource.getMinimumIdle());
        
//         return dataSource;
//     }
    
//     /**
//      * JdbcTemplate Bean (기존 코드 호환성 유지)
//      */
//     @Bean
//     public JdbcTemplate jdbcTemplate(DataSource dataSource) {
//         return new JdbcTemplate(dataSource);
//     }
    
//     /**
//      * NamedParameterJdbcTemplate Bean (기존 코드 호환성 유지)
//      */
//     @Bean
//     public NamedParameterJdbcTemplate namedParameterJdbcTemplate(DataSource dataSource) {
//         return new NamedParameterJdbcTemplate(dataSource);
//     }
// }