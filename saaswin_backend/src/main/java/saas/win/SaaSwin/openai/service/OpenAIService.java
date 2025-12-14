package saas.win.SaaSwin.openai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import saas.win.SaaSwin.openai.dto.OpenAIChatRequest;
import saas.win.SaaSwin.openai.dto.OpenAiResponseDTO;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class OpenAIService {
    private final WebClient.Builder webClientBuilder;
    @Value("${openai.api.key}")
    private String apiKey;
    public String askGpt(String prompt) {
        OpenAIChatRequest request = new OpenAIChatRequest(
                "gpt-4",
                List.of(
                        new OpenAIChatRequest.Message("system", """
                        너는 TypeScript 기반의 React JSX에서 사용할 SVG 차트를 그리는 전문가야.
                        JSX 문법에 맞는 <svg>, <rect>, <text> 태그만 사용해서 막대 차트를 구성해.
                        컴포넌트나 JavaScript 변수는 절대 포함하지 말고, 순수 태그만 JSX 문법에 맞게 출력해.
                        style 속성은 JSX 객체 형태로 작성하고, 설명이나 주석은 절대 넣지 마.
                        반드시 `<svg>`로 시작하고 `</svg>`로 끝나야 함. 그 외는 출력하지 마
                        """),
                        new OpenAIChatRequest.Message("user", prompt)
                )
        );

        OpenAiResponseDTO response = webClientBuilder.build().post()
                .uri("https://api.openai.com/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OpenAiResponseDTO.class)
                .block();

        if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
            String content = response.getChoices().get(0).getMessage().getContent();

            // ``` 제거
            content = content.replaceAll("(?s)^```(?:[a-zA-Z]*)?\\s*|\\s*```$", "").trim();

            return content;
        } else {
            return "GPT 응답이 없습니다.";
        }
    }
}
