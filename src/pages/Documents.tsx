import CrudPage from '@/components/CrudPage';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/services/api";
import { toast } from "sonner";

// const mockDocuments = [
//   { id: '1', title: 'Manual de Processos', description: 'Documentação completa', url: '/docs/manual.pdf', is_active: true, created_at: '2024-01-10T10:00:00Z', updated_at: '2024-06-01T14:00:00Z' },
//   { id: '2', title: 'Política de Segurança', description: 'Normas de segurança da informação', url: '/docs/seguranca.pdf', is_active: true, created_at: '2024-02-15T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
//   { id: '3', title: 'Fluxo de Aprovação', description: 'Processo de aprovação de compras', url: '/docs/aprovacao.pdf', is_active: true, created_at: '2024-03-20T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
// ];

const fields = [
  { key: 'title', label: 'Título', type: 'text' as const, required: true },
  { key: 'description', label: 'Descrição', type: 'textarea' as const },
  { key: 'fileUrl', label: 'URL', type: 'url' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];


export default function Documents() {
  const queryClient = useQueryClient();

  // 🔎 GET
  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await documentsApi.getAll();
      return response.data; // <- retorna o objeto completo
    },
  });

  // ➕ CREATE
  const createMutation = useMutation({
    mutationFn: (newDoc: any) => documentsApi.create(newDoc),
    onSuccess: () => {
      toast.success("Documento criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ✏ UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => documentsApi.update(id, data),
    onSuccess: () => {
      toast.success("Documento atualizado");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ❌ DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      toast.success("Documento removido");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <CrudPage
      title="Documentos"
      fields={fields}
      data={data?.data || []}       // 👈 aqui está a correção
      // total={data?.total || 0}      // opcional (se quiser paginação depois)
      onCreate={(formData) => createMutation.mutate(formData)}
      onUpdate={(id, formData) => updateMutation.mutate({ id, data: formData })}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  )
}
