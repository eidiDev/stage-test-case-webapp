import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processApi, areasApi, toolsApi, peopleApi, documentsApi } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Plus, Save, Trash2, X, Pencil } from "lucide-react";
import ProcessView  from "@/components/processes_ui/processView";
import ProcessEditForm from "@/components/processes_ui/processEditForm";

interface ProcessNode {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "IN_REVIEW" | "CRITICAL";
  type: "MANUAL" | "SYSTEM";
  priority: "LOW" | "MEDIUM" | "HIGH";
  area?: { id: string; name: string };
  children: ProcessNode[];
  created_at: string;
  updated_at: string;
}

export default function Processes() {
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState(false);
  const [form, setForm] = useState<any>({});

  // const [processForm, setProcessForm] = useState<any>(null);
  const [processForm, setProcessForm] = useState({
    name: "",
    description: "",
    type: "",
    status: "",
    priority: "",
    tools: [] as string[],
    responsiblePeople: [] as string[],
    documents: [] as string[],
  });
  const [editingProcess, setEditingProcess] = useState(false);

  // ------------------- QUERIES -------------------

  const { data: roots = [] } = useQuery({
    queryKey: ["processes"],
    queryFn: async () => {
      const res = await processApi.getAll();
      return res.data.data;
    },
  });

  const { data: tree, isLoading } = useQuery({
    queryKey: ["process-tree", selectedId],
    queryFn: async () => {
      const res = await processApi.getTree(selectedId!);
      return res.data;
    },
    enabled: !!selectedId,
  });

  useMemo(() => {
    if (tree) {
      setProcessForm({
        name: tree.name,
        description: tree.description,
        type: tree.type,
        status: tree.status,
        priority: tree.priority,
        tools: tree.tools?.map((t: any) => t.id) || [],
        responsiblePeople: tree.responsiblePeople?.map((p: any) => p.id) || [],
        documents: tree.documents?.map((d: any) => d.id) || [],
      });
    }
  }, [tree]);

  // ------------------- MUTATIONS -------------------

  const createMutation = useMutation({
    mutationFn: (data: any) => processApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["process-tree", selectedId],
      });

      queryClient.invalidateQueries({
        queryKey: ["processes"],
      });

      setNewRow(false);
      setForm({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => processApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-tree"] });
      setEditingId(null);
      setForm({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => processApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-tree"] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
  });

  const updateRootMutation = useMutation({
    mutationFn: ({ id, data }: any) => processApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-tree", selectedId] });
    },
  });

  // ------------------- FLATTEN TREE -------------------

  const flattenTree = (
    node: ProcessNode,
    level = 0
  ): (ProcessNode & { level: number })[] => {
    let rows: any[] = [{ ...node, level }];
    node.children?.forEach((child) => {
      rows = rows.concat(flattenTree(child, level + 1));
    });
    return rows;
  };

  const flatTree = useMemo(() => {
    if (!tree) return [];

    // pega apenas os filhos do root
    return tree.children?.flatMap((child: ProcessNode) =>
      flattenTree(child, 0)
    ) || [];
  }, [tree]);

  // ------------------- BADGES -------------------

  const Badge = ({ value, map }: any) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[value]}`}>
      {value}
    </span>
  );

  const statusMap = {
    ACTIVE: "bg-green-100 text-green-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  const typeMap = {
    MANUAL: "bg-gray-100 text-gray-700",
    SYSTEM: "bg-blue-100 text-blue-700",
  };

  const priorityMap = {
    LOW: "bg-emerald-100 text-emerald-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-red-100 text-red-700",
  };

  //  BUSCAR DADOS DE RELATIONS

  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const res = await areasApi.getAll();
      return res.data.data;
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const res = await toolsApi.getAll();
      return res.data.data;
    },
  });

  const { data: people = [] } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const res = await peopleApi.getAll();
      return res.data.data;
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await documentsApi.getAll();
      return res.data.data;
    },
  });

  // ------------------- RENDER -------------------
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold mb-6">Processos</h1>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">

        {/* LEFT */}
        <div className="col-span-4 crud-panel flex flex-col h-full overflow-hidden">
          <div className="panel-header flex justify-between shrink-0">
            <span>Processos</span>
            <span className="text-xs">{roots.length}</span>
          </div>

          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-2 w-3 h-3" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>

          <div className="p-2 flex-1 overflow-y-auto">
            {roots
              .filter((p: any) =>
                p.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-accent ${selectedId === p.id
                    ? "bg-accent border-l-4 border-primary"
                    : ""
                    }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.area?.name}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* MID */}
        <div className="col-span-5 crud-panel flex flex-col h-full overflow-hidden">

          {/* HEADER FIXO */}
          <div className="panel-header flex justify-between items-center shrink-0">
            <span>
              {tree ? `Árvore: ${tree.name}` : "Selecione um processo"}
            </span>

            {selectedId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!tree) return;

                  setNewRow(true);
                  setForm({
                    name: "",
                    status: "ACTIVE",
                    type: "MANUAL",
                    priority: "MEDIUM",
                    parent: { id: selectedId },
                    area: tree.area?.id
                      ? { id: tree.area.id }
                      : undefined,
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Subprocesso
              </Button>
            )}
          </div>

          {/* CONTEÚDO COM SCROLL ÚNICO */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">

            {/* ================= TABELA ================= */}
            {!isLoading && tree && (
              <div className="space-y-4">

                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Subprocessos
                </h3>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="p-3">Nome</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Prioridade</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>

                    <tbody>

                      {newRow && (
                        <tr className="border-t bg-muted/30">
                          <td className="p-3">
                            <Input
                              value={form.name || ""}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              placeholder="Nome do subprocesso"
                              className="h-8 text-sm"
                            />
                          </td>

                          <td className="p-3">
                            <select
                              value={form.status}
                              onChange={(e) =>
                                setForm({ ...form, status: e.target.value })
                              }
                              className="h-8 text-xs border rounded px-2 bg-background w-full"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="IN_REVIEW">IN_REVIEW</option>
                              <option value="CRITICAL">CRITICAL</option>
                            </select>
                          </td>

                          <td className="p-3">
                            <select
                              value={form.type}
                              onChange={(e) =>
                                setForm({ ...form, type: e.target.value })
                              }
                              className="h-8 text-xs border rounded px-2 bg-background w-full"
                            >
                              <option value="MANUAL">MANUAL</option>
                              <option value="SYSTEM">SYSTEM</option>
                            </select>
                          </td>

                          <td className="p-3">
                            <select
                              value={form.priority}
                              onChange={(e) =>
                                setForm({ ...form, priority: e.target.value })
                              }
                              className="h-8 text-xs border rounded px-2 bg-background w-full"
                            >
                              <option value="LOW">LOW</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="HIGH">HIGH</option>
                            </select>
                          </td>

                          <td className="p-3 flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const payload = {
                                  ...form,
                                  area: tree?.area?.id
                                    ? { id: tree.area.id }
                                    : undefined,
                                };
                                createMutation.mutate(payload);
                              }}
                            >
                              <Save className="w-4 h-4 text-green-600" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setNewRow(false);
                                setForm({});
                              }}
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </Button>
                          </td>
                        </tr>
                      )}

                      {!newRow && flatTree.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <div className="text-sm font-medium">
                                Nenhum subprocesso ainda
                              </div>
                              <div className="text-xs">
                                Clique em "Subprocesso" para adicionar o primeiro.
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {flatTree.map((node) => (
                        <tr key={node.id} className="border-t">
                          <td
                            className="p-3 font-medium"
                            style={{ paddingLeft: `${12 + node.level * 20}px` }}
                          >
                            {node.name}
                          </td>

                          <td className="p-3">
                            <Badge value={node.status} map={statusMap} />
                          </td>

                          <td className="p-3">
                            <Badge value={node.type} map={typeMap} />
                          </td>

                          <td className="p-3">
                            <Badge value={node.priority} map={priorityMap} />
                          </td>

                          <td className="p-3">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(node.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= INFORMAÇÕES ================= */}
            {tree && (
              <div className="space-y-6 border-t pt-8">

                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Informações do Processo
                </h3>

                {!editingProcess ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setProcessForm({
                        name: tree.name ?? "",
                        description: tree.description ?? "",
                        type: tree.type ?? "",
                        status: tree.status ?? "",
                        priority: tree.priority ?? "",
                        tools: tree.tools?.map((t: any) => t.id) ?? [],
                        responsiblePeople:
                          tree.responsiblePeople?.map((r: any) => r.id) ?? [],
                        documents: tree.documents?.map((d: any) => d.id) ?? [],
                      });

                      setEditingProcess(true);
                    }}
                  >
                    Editar
                  </Button>
                ) : null}

                {!editingProcess ? (
                  <ProcessView tree={tree} />
                ) : (
                  <ProcessEditForm
                    tree={tree}
                    processForm={processForm}
                    setProcessForm={setProcessForm}
                    setEditingProcess={setEditingProcess}
                    updateRootMutation={updateRootMutation}
                  />
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-3 crud-panel flex flex-col h-full overflow-hidden">
          <div className="panel-header shrink-0">Processo Raiz</div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <Button
              className="w-full justify-start"
              onClick={() =>
                createMutation.mutate({
                  name: "Novo Processo",
                  status: "ACTIVE",
                  type: "MANUAL",
                  priority: "MEDIUM",
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Processo
            </Button>

            {selectedId && (
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => deleteMutation.mutate(selectedId)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir Processo
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}