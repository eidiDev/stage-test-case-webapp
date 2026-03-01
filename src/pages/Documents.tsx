import CrudPage from '@/components/CrudPage';

const mockDocuments = [
  { id: '1', title: 'Manual de Processos', description: 'Documentação completa', url: '/docs/manual.pdf', is_active: true, created_at: '2024-01-10T10:00:00Z', updated_at: '2024-06-01T14:00:00Z' },
  { id: '2', title: 'Política de Segurança', description: 'Normas de segurança da informação', url: '/docs/seguranca.pdf', is_active: true, created_at: '2024-02-15T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
  { id: '3', title: 'Fluxo de Aprovação', description: 'Processo de aprovação de compras', url: '/docs/aprovacao.pdf', is_active: true, created_at: '2024-03-20T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
];

const fields = [
  { key: 'title', label: 'Título', type: 'text' as const, required: true },
  { key: 'description', label: 'Descrição', type: 'textarea' as const },
  { key: 'url', label: 'URL', type: 'url' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function Documents() {
  return <CrudPage title="Documentos" fields={fields} mockData={mockDocuments} />;
}
