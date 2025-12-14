//package saas.win.SaaSwin.config;
//
//import jdk.javadoc.doclet.Doclet;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//@EnableSwagger2
//public class SwaggerConfig {
//    @Bean
//    public Doclet api() {
//        return new Doclet(DocumentationType.SWAGGER_2) {
//        }
//                .select()
//                .apis(RequestHandlerSelectors.basePackage("com.example"))
//                .paths(PathSelectors.any())
//                .build()
//                .consumes(new HashSet<>(Arrays.asList("multipart/form-data")));
//    }
//}