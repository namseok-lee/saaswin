// No longer need OpenAI library
// import { OpenAI } from 'openai';

// Remove OpenAI client initialization
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// Define the Ollama API endpoint BASE URL
const OLLAMA_BASE_URL = process.env.OLLAMA_API_URL; // Updated default base URL
const OLLAMA_GENERATE_PATH = '/api/generate'; // Define the path separately
const OLLAMA_MODEL = 'gemma3:12b'; // Updated model name based on user input

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // --- Revert to expecting specific fields from RedisDdViewer ---
    const { dd_kind, std_key, std_val, korn_nm } = req.body;

    // --- Input Validation for specific fields ---
    if (!dd_kind || !std_key || !std_val || !korn_nm) {
        return res.status(400).json({ error: '필수 입력 필드(dd_kind, std_key, std_val, korn_nm)가 누락되었습니다.' });
    }

    // --- Re-introduce internal prompt construction ---
    const prompt = `다음 한국어 용어 정보를 바탕으로 관련 필드를 JSON 형식으로 생성해주세요:

    - 종류: ${dd_kind}
    - 표준 키: ${std_key}
    - 표준 값: ${std_val}
    - 한글 이름: ${korn_nm}

    생성할 필드와 요구사항:
    - korn_expln (한글 설명): '${korn_nm}'(${std_val})의 의미를 간결하고 명확하게 설명.
    - eng_nm (영어 이름): '${korn_nm}'에 대한 적절하고 일반적인 영어 명칭.
    - eng_expln (영어 설명): 영어 이름(eng_nm)에 대한 간결한 영어 설명.
    - cnl_nm (중국어 간체 이름): 적절한 중국어(간체) 명칭.
    - cnl_expln (중국어 간체 설명): 중국어(간체) 이름에 대한 간결한 설명.
    - jpl_nm (일본어 이름): 적절한 일본어 명칭.
    - jpl_expln (일본어 설명): 일본어 이름에 대한 간결한 설명.
    - ctfl_nm (중국어 번체 이름): 적절한 중국어(번체) 명칭.
    - ctfl_expln (중국어 번체 설명): 중국어(번체) 이름에 대한 간결한 설명.

    출력은 반드시 다음 키를 포함하는 JSON 객체여야 합니다: 
    "korn_expln", "eng_nm", "eng_expln", "cnl_nm", "cnl_expln", "jpl_nm", "jpl_expln", "ctfl_nm", "ctfl_expln"

    JSON 형식 예시:
    {
      "korn_expln": "...",
      "eng_nm": "...",
      "eng_expln": "...",
      "cnl_nm": "...",
      "cnl_expln": "...",
      "jpl_nm": "...",
      "jpl_expln": "...",
      "ctfl_nm": "...",
      "ctfl_expln": "..."
    }
    `;

    console.log('--- Sending Constructed Prompt to Ollama (/api/generate) ---');
    console.log(prompt);
    console.log('---------------------------------------------------------');

    try {
        // --- Call Ollama API ---
        const fullOllamaUrl = `${OLLAMA_BASE_URL.replace(/\/$/, '')}${OLLAMA_GENERATE_PATH}`; // Combine base URL and path safely
        console.log(`--- Calling Ollama API at: ${fullOllamaUrl} ---`);

        const ollamaResponse = await fetch(fullOllamaUrl, {
            // Use the combined URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt, // Use the internally constructed prompt
                stream: false,
                format: 'json',
            }),
        });

        if (!ollamaResponse.ok) {
            const errorText = await ollamaResponse.text();
            console.error('Ollama API Error Response:', errorText);
            throw new Error(`Ollama API 요청 실패 (상태: ${ollamaResponse.status}): ${errorText}`);
        }

        const ollamaResult = await ollamaResponse.json();
        const generatedContent = ollamaResult?.response;

        console.log('--- Ollama Response Content (/api/generate) ---');
        console.log(generatedContent);
        console.log('---------------------------------------------');

        if (!generatedContent) {
            // Check if response content exists
            throw new Error('Ollama로부터 유효한 응답 내용을 받지 못했습니다.');
        }

        // --- Parse and Validate JSON structure again ---
        let generatedJson;
        try {
            generatedJson = JSON.parse(generatedContent);
        } catch (parseError) {
            console.error('Ollama 응답 JSON 파싱 오류:', parseError);
            console.error('받은 내용:', generatedContent);
            throw new Error('Ollama로부터 받은 응답이 유효한 JSON 형식이 아닙니다.');
        }

        const requiredKeys = [
            'korn_expln',
            'eng_nm',
            'eng_expln',
            'cnl_nm',
            'cnl_expln',
            'jpl_nm',
            'jpl_expln',
            'ctfl_nm',
            'ctfl_expln',
        ];
        const missingKeys = requiredKeys.filter((key) => !(key in generatedJson));
        if (missingKeys.length > 0) {
            console.error('AI 응답에 누락된 키:', missingKeys);
            throw new Error(`AI 응답에 필요한 키 (${missingKeys.join(', ')})가 누락되었습니다.`);
        }

        // Send the validated JSON object back
        res.status(200).json(generatedJson);
    } catch (error) {
        console.error('Ollama API 처리 중 오류 (/api/generate):', error);
        const errorMessage = error instanceof Error ? error.message : 'AI 처리 중 알 수 없는 오류 발생';
        res.status(500).json({ error: errorMessage });
    }
}
