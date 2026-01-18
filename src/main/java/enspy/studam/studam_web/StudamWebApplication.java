package enspy.studam.studam_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class StudamWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudamWebApplication.class, args);
	}

	@Bean
	public OpenAPI springShopOpenAPI() {
		return new OpenAPI()
				.info(new Info().title("STUDAM WEB API")
						.description("Powerwed by STUDAM Team")
						.version("v1")
						.license(new License().name("Apache 2.4.29").url("https://polytechnique.cm/")))
				.externalDocs(new ExternalDocumentation()
						.description("License of API")
						.url("https://polytechnique.cm/"));
	}
}
