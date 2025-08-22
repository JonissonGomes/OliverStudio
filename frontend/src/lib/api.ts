const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = localStorage.getItem('auth_token');
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	const res = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
	});
	if (!res.ok) {
		let message = 'Erro na requisição';
		try {
			const data = await res.json();
			message = data?.message || message;
		} catch {}
		throw new Error(message);
	}
	return res.json();
}

export const api = {
	auth: {
		login: (email: string, password: string) =>
			apiRequest<{ token: string; user: any }>(`/auth/login`, {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			}),
		register: (email: string, password: string, fullName: string) =>
			apiRequest<{ token: string; user: any }>(`/auth/register`, {
				method: 'POST',
				body: JSON.stringify({ email, password, fullName }),
			}),
		me: () => apiRequest<{ user: any }>(`/auth/me`),
	},
}; 