export const getEventTypeColor = (tipoEvento: string) => {
  const colors = {
    'estudio': 'bg-blue-100 text-blue-800 border-blue-200',
    'evento': 'bg-purple-100 text-purple-800 border-purple-200',
    'aniversario': 'bg-pink-100 text-pink-800 border-pink-200',
    'mesversario': 'bg-orange-100 text-orange-800 border-orange-200',
    'gestante': 'bg-green-100 text-green-800 border-green-200',
    'formatura': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'debutante': 'bg-rose-100 text-rose-800 border-rose-200',
    'casamento': 'bg-amber-100 text-amber-800 border-amber-200',
  };
  
  return colors[tipoEvento as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};