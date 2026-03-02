import CrudPage from '@/components/CrudPage';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { peopleApi } from "@/services/api";
import { toast } from "sonner";

// const mockPeople = [
//   { id: '1', name: 'Carlos Silva', email: 'carlos@empresa.com', role: 'Gerente', is_active: true, created_at: '2024-01-05T10:00:00Z', updated_at: '2024-06-01T14:00:00Z' },
//   { id: '2', name: 'Ana Costa', email: 'ana@empresa.com', role: 'Analista', is_active: true, created_at: '2024-02-10T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
//   { id: '3', name: 'Pedro Santos', email: 'pedro@empresa.com', role: 'Desenvolvedor', is_active: true, created_at: '2024-03-15T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
//   { id: '4', name: 'Maria Oliveira', email: 'maria@empresa.com', role: 'Coordenadora', is_active: false, created_at: '2024-01-20T07:00:00Z', updated_at: '2024-04-15T11:00:00Z' },
// ];

const fields = [
  { key: 'name', label: 'Nome', type: 'text' as const, required: true },
  { key: 'email', label: 'Email', type: 'email' as const, required: true },
  { key: 'role', label: 'Cargo', type: 'text' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function People() {
  const queryClient = useQueryClient();

  // 🔎 GET
  const { data, isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await peopleApi.getAll();
      return response.data; // <- retorna o objeto completo
    },
  });

  // ➕ CREATE
  const createMutation = useMutation({
    mutationFn: (newPeople: any) => peopleApi.create(newPeople),
    onSuccess: () => {
      toast.success("Pessoa criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ✏ UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => peopleApi.update(id, data),
    onSuccess: () => {
      toast.success("Pessoa atualizada");
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ❌ DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => peopleApi.delete(id),
    onSuccess: () => {
      toast.success("Pessoa removida");
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <CrudPage
      title="Pessoas"
      fields={fields}
      data={data?.data || []}       // 👈 aqui está a correção
      // total={data?.total || 0}      // opcional (se quiser paginação depois)
      onCreate={(formData) => createMutation.mutate(formData)}
      onUpdate={(id, formData) => updateMutation.mutate({ id, data: formData })}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  )
}
