import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface DocumentInfo {
    title: string;
    hash: string;
    chunk_count: number;
}

export interface SearchResult {
    similarity: number;
    content: string;
    document_title: string;
    chunk_index: number;
}

export interface QAResponse {
    answer: string;
    context: Array<{
        text: string;
        document_title: string;
        similarity: number;
    }>;
}

export const api = {
    // Doküman işlemleri
    uploadDocument: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    listDocuments: async (): Promise<DocumentInfo[]> => {
        const response = await apiClient.get('/documents/list');
        return response.data;
    },

    searchDocuments: async (query: string, limit: number = 5): Promise<SearchResult[]> => {
        const response = await apiClient.post('/documents/search', { query, limit });
        return response.data;
    },

    // Soru-cevap işlemleri
    askQuestion: async (question: string, contextSize: number = 3): Promise<QAResponse> => {
        const response = await apiClient.post('/qa/ask', { question, context_size: contextSize });
        return response.data;
    },

    getRecentQuestions: async () => {
        const response = await apiClient.get('/qa/recent');
        return response.data;
    },
};

export default api; 