import CrudPage from '@/components/CrudPage';

const mockAreas = [
  { id: '1', name: 'Financeiro', description: 'Departamento financeiro', is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-06-01T14:30:00Z' },
  { id: '2', name: 'RH', description: 'Recursos Humanos', is_active: true, created_at: '2024-02-10T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
  { id: '3', name: 'TI', description: 'Tecnologia da Informação', is_active: true, created_at: '2024-03-05T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
  { id: '4', name: 'Operações', description: 'Operações e logística', is_active: false, created_at: '2024-01-20T07:00:00Z', updated_at: '2024-04-15T11:00:00Z' },
];

const fields = [
  { key: 'name', label: 'Nome', type: 'text' as const, required: true },
  { key: 'description', label: 'Descrição', type: 'textarea' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function Areas() {
  return <CrudPage title="Áreas" fields={fields} mockData={mockAreas} />;
}
