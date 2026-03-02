import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { areasApi } from "@/services/api";
import CrudPage from '@/components/CrudPage';
import { toast } from "sonner";

// const mockAreas = [
//   { id: '1', name: 'Financeiro', description: 'Departamento financeiro', is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-06-01T14:30:00Z' },
//   { id: '2', name: 'RH', description: 'Recursos Humanos', is_active: true, created_at: '2024-02-10T08:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
//   { id: '3', name: 'TI', description: 'Tecnologia da Informação', is_active: true, created_at: '2024-03-05T12:00:00Z', updated_at: '2024-06-10T16:00:00Z' },
//   { id: '4', name: 'Operações', description: 'Operações e logística', is_active: false, created_at: '2024-01-20T07:00:00Z', updated_at: '2024-04-15T11:00:00Z' },
// ];

const fields = [
  { key: 'name', label: 'Nome', type: 'text' as const, required: true },
  { key: 'description', label: 'Descrição', type: 'textarea' as const },
  { key: 'is_active', label: 'Ativo', type: 'boolean' as const },
];

export default function Areas() {
  const queryClient = useQueryClient();

  // 🔎 GET
  const { data, isLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const response = await areasApi.getAll();
      return response.data; // <- retorna o objeto completo
    },
  });

  // ➕ CREATE
  const createMutation = useMutation({
    mutationFn: (newArea: any) => areasApi.create(newArea),
    onSuccess: () => {
      toast.success("Área criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ✏ UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => areasApi.update(id, data),
    onSuccess: () => {
      toast.success("Área atualizada");
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  // ❌ DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => areasApi.delete(id),
    onSuccess: () => {
      toast.success("Área removida");
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
    onError: (error) => {
      toast.error(`${error?.message || error}`);
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <CrudPage
      title="Áreas"
      fields={fields}
      data={data?.data || []}       // 👈 aqui está a correção
      // total={data?.total || 0}      // opcional (se quiser paginação depois)
      onCreate={(formData) => createMutation.mutate(formData)}
      onUpdate={(id, formData) => updateMutation.mutate({ id, data: formData })}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  )
}
