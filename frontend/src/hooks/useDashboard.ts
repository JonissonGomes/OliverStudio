import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export interface DashboardData {
	eventosHoje: Array<{
		id: string;
		tipoEvento: string;
		data: string;
		cliente: string;
		preco: number;
		status: string;
		inicio: string;
		termino: string;
		local: string;
		cidade: string;
		fotografos: string[];
	}>;
	totalClientes: number;
	totalEventos: number;
	totalReceita: number;
}

export const useDashboard = () => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchDashboard = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiRequest('/dashboard');
			setData(response as DashboardData);
		} catch (err) {
			console.error('Erro ao buscar dashboard:', err);
			setError('Erro ao carregar dados do dashboard');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboard();
	}, []);

	return {
		data,
		loading,
		error,
		refetch: fetchDashboard
	};
}; 