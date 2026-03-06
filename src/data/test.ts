import { useEffect, useState } from "react";

type Error = {
    message: string;
} | null;

type UseFetchResult = {
    data: Record<string, any> | null;
    error: Error | null;
    loading: boolean;
}

const useFetch = (url: string) => {
    const [error, setError] = useState<Error>(null);
    const [data, setData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        return () => {
            // Cleanup if needed (e.g., aborting fetch)

        }
    }, [url]);

    return { data, error, loading } as UseFetchResult;

}

type METHODs = "GET" | "POST" | "PUT" | "DELETE";

class MailService {
    private apiUrl: string;
    private apiKey: string;
    private method: METHODs;

    constructor(apiUrl: string, apiKey: string) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.method = "POST"; // Default method
    }

    async getapiKey(): Promise<string> {
        return this.apiKey;
    }
    async getapiUrl(): Promise<string> {
        return this.apiUrl;
    }

    async setAPIKey(newKey: string): Promise<void> {
        this.apiKey = newKey;
    }
    async setAPIUrl(newUrl: string): Promise<void> {
        this.apiUrl = newUrl;
    }

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/send`, {
                method: this.method || "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({ to, subject, body }),
            });
            if (!response.ok) {
                throw new Error(`Failed to send email: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;

        }
    }

    setMethod(method: METHODs) {
        this.method = method;
    }
}

export { useFetch, MailService };