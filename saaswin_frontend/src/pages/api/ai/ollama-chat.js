import { NextRequest, NextResponse } from 'next/server';

// Define the Ollama API endpoint BASE URL and model
const OLLAMA_BASE_URL = process.env.OLLAMA_API_URL || 'http://218.236.10.153:11435';
const OLLAMA_CHAT_PATH = '/api/chat';
const OLLAMA_MODEL = 'gemma3:12b'; // Or the model you want to use for chat

// Helper function to call Serper API
async function searchWeb(query) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.warn('Serper API key not found in environment variables. Skipping web search.');
        return null;
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query }),
        });

        if (!response.ok) {
            console.error(`Serper API request failed with status ${response.status}:`, await response.text());
            return null;
        }

        const data = await response.json();

        // Extract snippets from organic results (adjust based on desired info)
        let snippets = [];
        if (data.organic && data.organic.length > 0) {
            snippets = data.organic
                .slice(0, 3)
                .map((item) => item.snippet)
                .filter(Boolean);
            // Maybe also include answer box if available
            if (data.answerBox?.snippet) {
                snippets.unshift(data.answerBox.snippet);
            }
        }

        if (snippets.length > 0) {
            console.log('Web search results snippets:', snippets.join('\n---\n'));
            return snippets.join('\n---\n'); // Join snippets for context
        } else {
            console.log('No relevant snippets found from web search.');
            return null;
        }
    } catch (error) {
        console.error('Error during web search:', error);
        return null;
    }
}

export const config = {
    runtime: 'edge', // Use Edge Runtime for streaming capabilities
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
            status: 405,
            headers: { Allow: 'POST', 'Content-Type': 'application/json' },
        });
    }

    try {
        const { messages } = await req.json();

        // --- Input Validation ---
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "Missing or invalid 'messages' in request body" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const fullOllamaUrl = `${OLLAMA_BASE_URL.replace(/\/$/, '')}${OLLAMA_CHAT_PATH}`;
        console.log(`--- Calling Ollama Chat API at: ${fullOllamaUrl} with model ${OLLAMA_MODEL} ---`);

        // --- RAG Implementation Start ---
        const userQuery = messages[messages.length - 1].content;
        let shouldSearchWeb = false;
        let webContext = null;

        // 웹 검색 트리거 키워드/조건 확인
        const searchTriggers = ['웹 검색', '검색해서', '찾아줘', '알려줘', '현재', '지금', '최신']; // 예시 키워드
        if (userQuery && searchTriggers.some((trigger) => userQuery.includes(trigger))) {
            shouldSearchWeb = true;
        }

        // 트리거 조건 만족 시 웹 검색 수행
        if (shouldSearchWeb && userQuery) {
            console.log(`Web search triggered for query: "${userQuery}"`);
            webContext = await searchWeb(userQuery);
        } else {
            console.log('Web search not triggered for this query.');
        }

        // Prepare messages for Ollama, potentially adding web context
        let messagesForOllama = [...messages];
        if (webContext) {
            // Insert web context before the last user message for better instruction following
            const contextMessage = {
                role: 'system', // Or could be user role for some models
                content: `--- 웹 검색 결과 시작 ---\n${webContext}\n--- 웹 검색 결과 끝 --- 다음 웹 검색 결과를 참고하여 사용자의 마지막 질문에 답해주세요.`,
            };
            // Insert before the last message
            messagesForOllama.splice(messagesForOllama.length - 1, 0, contextMessage);
            console.log('Augmented messages for Ollama:', messagesForOllama);
        } else {
            // console.log("No web context added. Proceeding with original messages."); // 로그 줄임
        }
        // --- RAG Implementation End ---

        // --- Call Ollama Chat API ---
        const ollamaResponse = await fetch(fullOllamaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: messagesForOllama, // Use potentially augmented messages
                stream: true, // Enable streaming response
            }),
        });

        if (!ollamaResponse.ok) {
            const errorText = await ollamaResponse.text();
            console.error('Ollama API Error Response:', errorText);
            // Don't stream the error, return a JSON error object
            return new Response(
                JSON.stringify({ error: `Ollama API request failed (status: ${ollamaResponse.status}): ${errorText}` }),
                {
                    status: 500, // Or map Ollama status if possible
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // --- Stream the response back to the client ---
        // Ensure the response stream from Ollama is correctly piped
        // Use TextEncoderStream if specific encoding is needed, otherwise ReadableStream should work
        const stream = ollamaResponse.body;

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8', // Or application/octet-stream
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Error in Ollama chat handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
