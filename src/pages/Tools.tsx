import CrudPage from '@/components/CrudPage';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toolsApi } from "@/services/api";
import { toast } from "sonner";

// const mockTools = [
//   { id: '1', name: 'Jira', description: 'Gestão de projetos', url: 'https://jira.com', is_active: true, created_at: '2024-01-10T10:00:00Z', updated_at: '2024-06-01T14:00:00Z' },
//   { id: '2', name: 'Slack', description: 'Comunicação', url: 'https://slack.com', is_active: true, created_at: '2024-02-15T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
//   { id: '3', name: 'Confluence', description: 'Documentação', url: 'https://confluence.com', is_active: true, created_at: '2024-03-20T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
// ];

const fields = [
  { key: 'title', label: 'Titulo Ferramenta', type: 'text' as const, required: true },
  { key: 'description', label: 'Descrição', type: 'textarea' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function Tools() {
  const queryClient = useQueryClient();

  // 🔎 GET
  const { data, isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const response = await toolsApi.getAll();
      return response.data; // <- retorna o objeto completo
    },
  });

  // ➕ CREATE
  const createMutation = useMutation({
    mutationFn: (newTool: any) => toolsApi.create(newTool),
    onSuccess: () => {
      toast.success("Ferramenta criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ✏ UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => toolsApi.update(id, data),
    onSuccess: () => {
      toast.success("Ferramenta atualizada");
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ❌ DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => toolsApi.delete(id),
    onSuccess: () => {
      toast.success("Ferramenta removida");
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <CrudPage
      title="Ferramentas"
      fields={fields}
      data={data?.data || []}       // 👈 aqui está a correção
      // total={data?.total || 0}      // opcional (se quiser paginação depois)
      onCreate={(formData) => createMutation.mutate(formData)}
      onUpdate={(id, formData) => updateMutation.mutate({ id, data: formData })}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  )
}
