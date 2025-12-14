package saas.win.SaaSwin.openai.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.openai.dto.OpenAIRequestDTO;
import saas.win.SaaSwin.openai.service.OpenAIService;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
@Slf4j
public class OpenAIController {
    final private OpenAIService openAIService;
    @Operation(summary = "AI기반 Chart생성", description = "chatGPT로 chart를 생성한다.")
    @Description("chatGPT로 chart를 생성한다.")
    @PostMapping("/api/openAI/0001")
    public String getChartCode(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody OpenAIRequestDTO request) {
        String prompt = String.format("""
        아래 데이터를 기반으로 html 태그(SVG)를 작성해줘.
        - 제목: %s
        - 항목: %s
        - 차트유형: %s
        - 값: %s
        
        출력 요구사항 (매우 중요):
            - JSX, React, JavaScript, 함수, 컴포넌트 선언 없이 **오직 `<svg>`, `<rect>`, `<text>` 등 HTML/SVG 태그만** 출력할 것
            - 색상, 폰트 등의 스타일은 `style` 속성을 사용하지 말고, 반드시 `fill="..."`, `font-size="..."` 와 같은 HTML 속성(attribute)으로 직접 작성할 것
            - 코드 외에 **텍스트 설명, 설치 안내, 주석, 함수 정의, const/let 등 JavaScript 요소는 절대 포함하지 말 것**
            - 반환 값에는 `<svg>...</svg>` 내부에 들어가는 순수 태그만 포함해야 함
            - **중요:** 막대는 아래에서 위로 올라가는 방향으로 그릴 것 \s
              (즉, y=0이 위쪽인 SVG 좌표계 특성에 따라, 막대가 아래에서 위로 성장하는 구조로 만들어야 함. \s
              막대의 y 값은 `차트 높이 - 막대 높이`로 계산되어야 함)
            - **속성 값(x, y, width, height 등)은 계산식이 아닌 최종 계산된 숫자값으로만 작성할 것**
            - `<text>` 태그에는 `fill`, `fontSize`를 명확히 설정할 것
            -  **항목명(Label)은 각 막대의 아래에 위치하도록 `y` 좌표를 충분히 아래로 배치할 것 (예: `y=580` 등으로 설정)**
            -  **출력은 `<svg>...</svg>` 코드 한 블록으로만 구성하고, 설명은 포함하지 말 것**
            - ✅ 추가 요구: SVG 차트에는 기준선으로 사용할 `x축(수평선)`과 `y축(수직선)`을 포함할 것 \s
               - SVG 차트에는 기준선으로 사용할 x축(수평선)과 y축(수직선)을 `<line>` 태그로 포함할 것 \s
               - y축에는 눈금 수치를 `<text>` 태그로 함께 출력할 것 (예: `0`, `50`, ..., `최대값`) \s
               - 눈금 텍스트는 `x=20`, `text-anchor="end"`로 정렬하고, y좌표는 눈금선에 맞춰 위에서 아래로 계산할 것
               - 각 막대 내부 또는 위에 해당 값(예: `5`, `12`, `8`)을 `<text>` 태그로 표시할 것 \s
               - 텍스트는 막대 상단 또는 중앙에 위치하고, `fill` 색상은 대비되게 설정하며, `text-anchor="middle"`과 `font-size="12"`를 사용
            절대 유의: 설명, 해석, 해설, 예시 문장, 친절한 마무리 멘트는 포함하지 말 것. \s
            출력은 **<svg>로 시작해서 </svg>로 끝나는 코드 한 블록만 반환할 것.** \s
            그 외의 텍스트는 한 글자도 포함하지 말 것.
        """, request.getTitle(), request.getLabels(), request.getType(), request.getValues());

        return openAIService.askGpt(prompt); // 앞서 설명한 GPT 호출 로직 사용
    }
}
