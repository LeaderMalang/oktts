const API_BASE = 'http://127.0.0.1:8000/api/management';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Token ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res.json();
}

export const getEntities = <T>(entity: string) =>
    request<T[]>(`${API_BASE}/${entity}/`);

export const createEntity = <T>(entity: string, data: Partial<T>) =>{
    console.log(entity, data);
    request<T>(`${API_BASE}/${entity}/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
    

export const updateEntity = <T>(entity: string, id: number, data: Partial<T>) =>
    request<T>(`${API_BASE}/${entity}/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

