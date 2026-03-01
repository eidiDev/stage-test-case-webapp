import CrudPage from '@/components/CrudPage';

const mockPeople = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@empresa.com', role: 'Gerente', is_active: true, created_at: '2024-01-05T10:00:00Z', updated_at: '2024-06-01T14:00:00Z' },
  { id: '2', name: 'Ana Costa', email: 'ana@empresa.com', role: 'Analista', is_active: true, created_at: '2024-02-10T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@empresa.com', role: 'Desenvolvedor', is_active: true, created_at: '2024-03-15T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
  { id: '4', name: 'Maria Oliveira', email: 'maria@empresa.com', role: 'Coordenadora', is_active: false, created_at: '2024-01-20T07:00:00Z', updated_at: '2024-04-15T11:00:00Z' },
];

const fields = [
  { key: 'name', label: 'Nome', type: 'text' as const, required: true },
  { key: 'email', label: 'Email', type: 'email' as const, required: true },
  { key: 'role', label: 'Cargo', type: 'text' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function People() {
  return <CrudPage title="Pessoas" fields={fields} mockData={mockPeople} />;
}
