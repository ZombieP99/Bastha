import axios from 'axios';
export function errorMessage(error: unknown, fallback = 'تعذر إتمام العملية / Request failed'): string {
    if (axios.isAxiosError<{
        error?: string;
    }>(error))
        return error.response?.data?.error || fallback;
    return error instanceof Error ? error.message : fallback;
}
