import CrudPage from '@/components/CrudPage';

const mockTools = [
  { id: '1', name: 'Jira', description: 'Gestão de projetos', url: 'https://jira.com', is_active: true, created_at: '2024-01-10T10:00:00Z', updated_at: '2024-06-01T14:00:00Z' },
  { id: '2', name: 'Slack', description: 'Comunicação', url: 'https://slack.com', is_active: true, created_at: '2024-02-15T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
  { id: '3', name: 'Confluence', description: 'Documentação', url: 'https://confluence.com', is_active: true, created_at: '2024-03-20T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
];

const fields = [
  { key: 'name', label: 'Nome', type: 'text' as const, required: true },
  { key: 'description', label: 'Descrição', type: 'textarea' as const },
  { key: 'url', label: 'URL', type: 'url' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function Tools() {
  return <CrudPage title="Ferramentas" fields={fields} mockData={mockTools} />;
}
