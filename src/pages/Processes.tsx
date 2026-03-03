import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  processApi,
  areasApi,
  toolsApi,
  peopleApi,
  documentsApi,
} from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Save, Trash2, X } from "lucide-react";
import ProcessView from "@/components/processes_ui/processView";
import ProcessEditForm from "@/components/processes_ui/processEditForm";
import MultiSelect from "@/components/processes_ui/multiSelect";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ✅ Toast (Sonner)
import { toast } from "sonner";

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

type RootCreateForm = {
  name: string;
  description: string;
  type: "MANUAL" | "SYSTEM";
  status: "ACTIVE" | "IN_REVIEW" | "CRITICAL";
  priority: "LOW" | "MEDIUM" | "HIGH";
  areaId: string; // single relation
  tools: string[];
  responsiblePeople: string[];
  documents: string[];
};

// ✅ Ajuste aqui: se sua regra de negócio exigir área obrigatória
const AREA_REQUIRED = true;
const NONE_VALUE = "__NONE__";

const DEFAULT_ROOT: RootCreateForm = {
  name: "",
  description: "",
  type: "MANUAL",
  status: "ACTIVE",
  priority: "MEDIUM",
  areaId: "",
  tools: [],
  responsiblePeople: [],
  documents: [],
};


export default function Processes() {

  function pickArray(resData: any) {
    // suporta { data: [...] }, { data: { data: [...] } }, ou array direto
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.data)) return resData.data;
    if (Array.isArray(resData?.data?.data)) return resData.data.data;
    return [];
  }

  const autoSelectedRef = useRef(false);

  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // subprocesso
  const [newRow, setNewRow] = useState(false);
  const [form, setForm] = useState<any>({});

  // edit root existente
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

  // ✅ NOVO: modo criação de root
  const [creatingRoot, setCreatingRoot] = useState(false);
  const [rootForm, setRootForm] = useState<RootCreateForm>(DEFAULT_ROOT);

  // buscas dos multiselects (local)
  const [toolSearch, setToolSearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");

  // ------------------- QUERIES -------------------

  const { data: roots = [] } = useQuery({
    queryKey: ["processes"],
    queryFn: async () => {
      const res = await processApi.getAll();
      return res.data.data;
    },
  });

  useEffect(() => {
    // só auto-seleciona quando a tela abre sem seleção
    if (selectedId) return;
    if (!roots?.length) return;

    setEditingProcess(false);
    setNewRow(false);
    setForm({});

    autoSelectedRef.current = true;
    setSelectedId(roots[0].id);
  }, [roots, selectedId]);

  const { data: tree, isLoading } = useQuery({
    queryKey: ["process-tree", selectedId],
    queryFn: async () => {
      const res = await processApi.getTree(selectedId!);
      return res.data;
    },
    enabled: !!selectedId && !creatingRoot, // não carregar árvore enquanto cria root
  });

  useEffect(() => {
    if (!tree) return;
    if (!autoSelectedRef.current) return;

    toast.success(`Processo ${tree?.name} selecionado com sucesso.`);
    autoSelectedRef.current = false;
  }, [tree]);

  useEffect(() => {
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

  // relations
  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const res = await areasApi.getAll();
      return res.data; // retorna bruto
    },
    select: pickArray, // ✅ transforma TANTO o cache quanto a resposta nova em array
    initialData: [],   // ✅ garante array no primeiro render
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const res = await toolsApi.getAll();
      return res.data;
    },
    select: pickArray,
    initialData: [],
  });

  const { data: people = [] } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const res = await peopleApi.getAll();
      return res.data;
    },
    select: pickArray,
    initialData: [],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await documentsApi.getAll();
      return res.data;
    },
    select: pickArray,
    initialData: [],
  });

  // ------------------- MUTATIONS -------------------

  // subprocesso (mantido)
  const createMutation = useMutation({
    mutationFn: (data: any) => processApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-tree", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      setNewRow(false);
      setForm({});
    },
    onError: (err: any) => {
      toast.error("Erro ao criar subprocesso", {
        description: err?.response?.data?.message ?? "Tente novamente.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => processApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-tree"] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      toast.success("Processo excluído com sucesso.");
    },
    onError: (err: any) => {
      toast.error("Erro ao excluir processo", {
        description: err?.response?.data?.message ?? "Tente novamente.",
      });
    },
  });

  const updateRootMutation = useMutation({
    mutationFn: ({ id, data }: any) => processApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-tree", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      toast.success("Processo atualizado.");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar processo", {
        description: err?.response?.data?.message ?? "Tente novamente.",
      });
    },
  });

  // ✅ NOVO: criar root
  const createRootMutation = useMutation({
    mutationFn: (data: any) => processApi.create(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });

      // tenta pegar o root criado
      const created = res?.data;

      toast.success("Processo raiz criado com sucesso.");

      setCreatingRoot(false);
      setNewRow(false);
      setForm({});
      setToolSearch("");
      setPeopleSearch("");
      setDocSearch("");
      setAreaSearch("");

      // ✅ selecionar root recém-criado e abrir em edit
      if (created?.id) {
        setSelectedId(created.id);
      }

      // ✅ já abre em edit (com fallback: se tree ainda não carregou, vai abrir assim que carregar)
      setEditingProcess(true);

      // ✅ preencher processForm imediatamente se backend devolver os campos
      setProcessForm({
        name: created?.name ?? rootForm.name,
        description: created?.description ?? rootForm.description,
        type: created?.type ?? rootForm.type,
        status: created?.status ?? rootForm.status,
        priority: created?.priority ?? rootForm.priority,
        tools:
          created?.tools?.map((t: any) => t.id) ??
          (rootForm.tools || []),
        responsiblePeople:
          created?.responsiblePeople?.map((p: any) => p.id) ??
          (rootForm.responsiblePeople || []),
        documents:
          created?.documents?.map((d: any) => d.id) ??
          (rootForm.documents || []),
      });

      // reset root form
      setRootForm(DEFAULT_ROOT);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar processo raiz", {
        description:
          err?.response?.data?.message ??
          "Verifique os campos e tente novamente.",
      });
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
    return (
      tree.children?.flatMap((child: ProcessNode) => flattenTree(child, 0)) || []
    );
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

  // ------------------- OPTIONS (para MultiSelect) -------------------

  const toolOptions = useMemo(() => {
    const q = toolSearch.trim().toLowerCase();
    const base = (tools || []).map((t: any) => ({
      id: t.id,
      name: t.title ?? t.name ?? "Sem nome",
    }));
    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base;
  }, [tools, toolSearch]);

  const peopleOptions = useMemo(() => {
    const q = peopleSearch.trim().toLowerCase();
    const base = (people || []).map((p: any) => ({
      id: p.id,
      name: p.name ?? p.title ?? "Sem nome",
    }));
    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base;
  }, [people, peopleSearch]);

  const documentOptions = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    const base = (documents || []).map((d: any) => ({
      id: d.id,
      name: d.title ?? d.name ?? "Sem nome",
    }));
    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base;
  }, [documents, docSearch]);

  const areaOptions = useMemo(() => {
    const q = areaSearch.trim().toLowerCase();
    const base = pickArray(areas).map((a: any) => ({
      id: a.id,
      name: a.name ?? "Sem nome",
    }));

    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base;
  }, [areas, areaSearch]);

  // ------------------- ACTIONS -------------------

  const startNewRoot = () => {
    setCreatingRoot(true);
    setEditingProcess(false);


    // impede ações de subprocesso
    setNewRow(false);
    setForm({});

    // limpa seleção e UI do meio
    setSelectedId(null);

    setRootForm(DEFAULT_ROOT);
    setToolSearch("");
    setPeopleSearch("");
    setDocSearch("");
    setAreaSearch("");
  };

  const cancelNewRoot = () => {
    setCreatingRoot(false);
    setRootForm(DEFAULT_ROOT);
    setToolSearch("");
    setPeopleSearch("");
    setDocSearch("");
    setAreaSearch("");
  };

  const validateRoot = () => {
    if (!rootForm.name.trim()) {
      toast.error("Nome é obrigatório.");
      return false;
    }
    if (AREA_REQUIRED && !rootForm.areaId) {
      toast.error("Área é obrigatória.");
      return false;
    }
    return true;
  };

  const saveNewRoot = () => {
    if (!validateRoot()) return;

    const payload: any = {
      name: rootForm.name.trim(),
      description: rootForm.description ?? "",
      type: rootForm.type,
      status: rootForm.status,
      priority: rootForm.priority,

      // 👇 AQUI É O PONTO IMPORTANTE
      area: rootForm.areaId
        ? { id: rootForm.areaId }
        : undefined,

      tools: (rootForm.tools || []).map((id) => ({ id })),
      responsiblePeople: (rootForm.responsiblePeople || []).map((id) => ({ id })),
      documents: (rootForm.documents || []).map((id) => ({ id })),
    };

    createRootMutation.mutate(payload);
  };

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
                  onClick={() => {
                    setCreatingRoot(false);
                    setSelectedId(p.id);
                    setEditingProcess(false);
                    toast.success(`Processo ${p?.name} selecionado com sucesso.`);
                  }}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-accent ${selectedId === p.id ? "bg-accent border-l-4 border-primary" : ""
                    }`}
                  disabled={createRootMutation.isPending}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.area?.name}</div>
                </button>
              ))}
          </div>
        </div>

        {/* MID */}
        <div className="col-span-5 crud-panel flex flex-col h-full overflow-hidden">
          {/* HEADER FIXO */}
          <div className="panel-header flex justify-between items-center shrink-0">
            <span>
              {creatingRoot
                ? "Criando Processo Raiz"
                : tree
                  ? `Árvore: ${tree.name}`
                  : "Selecione um processo"}
            </span>

            {/* ✅ não permite subprocesso no modo criação */}
            {!creatingRoot && selectedId && (
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
                    area: tree.area?.id ? { id: tree.area.id } : undefined,
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
            {creatingRoot ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Subprocessos
                </h3>

                <div className="border rounded-lg p-10 text-center text-muted-foreground">
                  A tabela de subprocessos fica vazia durante a criação de um Processo Raiz.
                </div>
              </div>
            ) : (
              !isLoading &&
              tree && (
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
              )
            )}

            {/* ================= INFORMAÇÕES ================= */}
            {creatingRoot ? (
              <div className="space-y-6 border-t pt-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Informações do Processo Raiz
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={rootForm.name}
                      onChange={(e) =>
                        setRootForm({ ...rootForm, name: e.target.value })
                      }
                      placeholder="Nome"
                    />

                    <Select
                      value={rootForm.status}
                      onValueChange={(v) =>
                        setRootForm({ ...rootForm, status: v as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="IN_REVIEW">Em revisão</SelectItem>
                        <SelectItem value="CRITICAL">Crítico</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={rootForm.type}
                      onValueChange={(v) =>
                        setRootForm({ ...rootForm, type: v as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="SYSTEM">Sistema</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={rootForm.priority}
                      onValueChange={(v) =>
                        setRootForm({ ...rootForm, priority: v as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Input
                    value={rootForm.description}
                    onChange={(e) =>
                      setRootForm({ ...rootForm, description: e.target.value })
                    }
                    placeholder="Descrição"
                  />

                  {/* Área */}
                  <div className="space-y-1">

                    <MultiSelect
                      label={`Área${AREA_REQUIRED ? " *" : ""}`}
                      options={areaOptions}
                      selected={rootForm.areaId ? [rootForm.areaId] : []}
                      onChange={(val) => {
                        // single-select: mantém somente 1
                        const last = val?.[val.length - 1];
                        setRootForm({ ...rootForm, areaId: last ?? "" });
                      }}
                      searchValue={areaSearch}
                      onSearchValueChange={setAreaSearch}
                      loading={false}
                      placeholder='Buscar por "name"...'
                    />
                  </div>

                  <MultiSelect
                    label="Ferramentas"
                    options={toolOptions}
                    selected={rootForm.tools}
                    onChange={(val) => setRootForm({ ...rootForm, tools: val })}
                    searchValue={toolSearch}
                    onSearchValueChange={setToolSearch}
                    loading={false}
                    placeholder='Buscar por "title"...'
                  />

                  <MultiSelect
                    label="Responsáveis"
                    options={peopleOptions}
                    selected={rootForm.responsiblePeople}
                    onChange={(val) =>
                      setRootForm({ ...rootForm, responsiblePeople: val })
                    }
                    searchValue={peopleSearch}
                    onSearchValueChange={setPeopleSearch}
                    loading={false}
                    placeholder='Buscar por "name"...'
                  />

                  <MultiSelect
                    label="Documentos"
                    options={documentOptions}
                    selected={rootForm.documents}
                    onChange={(val) =>
                      setRootForm({ ...rootForm, documents: val })
                    }
                    searchValue={docSearch}
                    onSearchValueChange={setDocSearch}
                    loading={false}
                    placeholder='Buscar por "title"...'
                  />
                </div>
              </div>
            ) : (
              tree && (
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
              )
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-3 crud-panel flex flex-col h-full overflow-hidden">
          <div className="panel-header shrink-0">Processo Raiz</div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {!creatingRoot ? (
              <>
                <Button className="w-full justify-start" onClick={startNewRoot}>
                  <Plus className="w-4 h-4 mr-2" /> Novo Processo Raiz
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
              </>
            ) : (
              <>
                <Button
                  className="w-full justify-start"
                  onClick={saveNewRoot}
                  disabled={createRootMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createRootMutation.isPending ? "Salvando..." : "Salvar Processo Raiz"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={cancelNewRoot}
                  disabled={createRootMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}