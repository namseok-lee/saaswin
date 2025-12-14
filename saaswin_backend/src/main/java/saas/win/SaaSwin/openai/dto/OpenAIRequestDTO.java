package saas.win.SaaSwin.openai.dto;

import lombok.Data;

import java.util.List;

@Data
public class OpenAIRequestDTO {
    private String title;
    private List<String> labels;
    private String type;
    private List<Integer> values;
}



