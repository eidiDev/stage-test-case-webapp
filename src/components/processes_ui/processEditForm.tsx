import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import MultiSelect from "./multiSelect";
import { toolsApi, peopleApi, documentsApi } from "@/services/api";

// shadcn select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function pickList(res: any) {
  return (res?.data?.data ?? res?.data ?? []) as any[];
}

function buildContLFilter(field: string, q?: string) {
  const value = (q || "").trim();
  if (!value) return {};
  return { filter: `${field}||$contL||${value}` };
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

type Option = { id: string; name: string };

function uniqById(items: Option[]) {
  const map = new Map<string, Option>();
  for (const it of items) map.set(it.id, it);
  return Array.from(map.values());
}

// ✅ enums reais do backend
const TYPE_OPTIONS = [
  { value: "MANUAL", label: "MANUAL" },
  { value: "SYSTEM", label: "SYSTEM" },
] as const;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "IN_REVIEW", label: "IN_REVIEW" },
  { value: "CRITICAL", label: "CRITICAL" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "LOW" },
  { value: "MEDIUM", label: "MEDIUM" },
  { value: "HIGH", label: "HIGH" },
] as const;

// se o valor atual não existir nas opções (enum mudou / dados antigos), não quebra o edit
function ensureCurrentOption(
  options: { value: string; label: string }[],
  current?: string
) {
  const c = (current ?? "").trim();
  if (!c) return options;
  if (options.some((o) => o.value === c)) return options;
  return [{ value: c, label: `(Atual) ${c}` }, ...options];
}

export default function ProcessEditForm({
  tree,
  processForm,
  setProcessForm,
  setEditingProcess,
  updateRootMutation,
}: any) {
  // ---- search state por relação ----
  const [toolSearch, setToolSearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");

  const toolQ = useDebouncedValue(toolSearch);
  const peopleQ = useDebouncedValue(peopleSearch);
  const docQ = useDebouncedValue(docSearch);

  // ---- catálogos remotos ----
  const toolsQuery = useQuery({
    queryKey: ["tools-catalog", toolQ],
    queryFn: async () => {
      const params = buildContLFilter("title", toolQ);
      const res = await toolsApi.getAllFilter(params);
      return pickList(res);
    },
    enabled: !!tree,
    staleTime: 5 * 60 * 1000,
  });

  const peopleQuery = useQuery({
    queryKey: ["people-catalog", peopleQ],
    queryFn: async () => {
      const params = buildContLFilter("name", peopleQ);
      const res = await peopleApi.getAllFilter(params);
      return pickList(res);
    },
    enabled: !!tree,
    staleTime: 5 * 60 * 1000,
  });

  const docsQuery = useQuery({
    queryKey: ["documents-catalog", docQ],
    queryFn: async () => {
      const params = buildContLFilter("title", docQ);
      const res = await documentsApi.getAllFilter(params);
      return pickList(res);
    },
    enabled: !!tree,
    staleTime: 5 * 60 * 1000,
  });

  // ---- normalização + merge com selecionados atuais ----
  const toolOptions: Option[] = useMemo(() => {
    const fetched = (toolsQuery.data || []).map((t: any) => ({
      id: t.id,
      name: t.title ?? t.name ?? "Sem nome",
    }));

    const selectedFromTree = (tree?.tools || []).map((t: any) => ({
      id: t.id,
      name: t.title ?? t.name ?? "Sem nome",
    }));

    return uniqById([...fetched, ...selectedFromTree]);
  }, [toolsQuery.data, tree?.tools]);

  const peopleOptions: Option[] = useMemo(() => {
    const fetched = (peopleQuery.data || []).map((p: any) => ({
      id: p.id,
      name: p.name ?? p.title ?? "Sem nome",
    }));

    const selectedFromTree = (tree?.responsiblePeople || []).map((p: any) => ({
      id: p.id,
      name: p.name ?? p.title ?? "Sem nome",
    }));

    return uniqById([...fetched, ...selectedFromTree]);
  }, [peopleQuery.data, tree?.responsiblePeople]);

  const documentOptions: Option[] = useMemo(() => {
    const fetched = (docsQuery.data || []).map((d: any) => ({
      id: d.id,
      name: d.title ?? d.name ?? "Sem nome",
    }));

    const selectedFromTree = (tree?.documents || []).map((d: any) => ({
      id: d.id,
      name: d.title ?? d.name ?? "Sem nome",
    }));

    return uniqById([...fetched, ...selectedFromTree]);
  }, [docsQuery.data, tree?.documents]);

  const typeOptions = useMemo(
    () => ensureCurrentOption([...TYPE_OPTIONS], processForm.type),
    [processForm.type]
  );
  const statusOptions = useMemo(
    () => ensureCurrentOption([...STATUS_OPTIONS], processForm.status),
    [processForm.status]
  );
  const priorityOptions = useMemo(
    () => ensureCurrentOption([...PRIORITY_OPTIONS], processForm.priority),
    [processForm.priority]
  );

  const handleSave = () => {
    updateRootMutation.mutate({
      id: tree.id,
      data: {
        name: processForm.name,
        description: processForm.description,
        type: processForm.type,
        status: processForm.status,
        priority: processForm.priority,

        tools: (processForm.tools || []).map((id: string) => ({ id })),
        responsiblePeople: (processForm.responsiblePeople || []).map(
          (id: string) => ({ id })
        ),
        documents: (processForm.documents || []).map((id: string) => ({ id })),
      },
    });

    setEditingProcess(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          value={processForm.name}
          onChange={(e) =>
            setProcessForm({ ...processForm, name: e.target.value })
          }
          placeholder="Nome"
        />

        {/* ✅ STATUS */}
        <Select
          value={processForm.status ?? ""}
          onValueChange={(v) => setProcessForm({ ...processForm, status: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ✅ TYPE */}
        <Select
          value={processForm.type ?? ""}
          onValueChange={(v) => setProcessForm({ ...processForm, type: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ✅ PRIORITY */}
        <Select
          value={processForm.priority ?? ""}
          onValueChange={(v) =>
            setProcessForm({ ...processForm, priority: v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={processForm.description}
        onChange={(e) =>
          setProcessForm({ ...processForm, description: e.target.value })
        }
        placeholder="Descrição"
      />

      <MultiSelect
        label="Ferramentas"
        options={toolOptions}
        selected={processForm.tools || []}
        onChange={(val) => setProcessForm({ ...processForm, tools: val })}
        searchValue={toolSearch}
        onSearchValueChange={setToolSearch}
        loading={toolsQuery.isFetching}
        placeholder='Buscar por "title"...'
      />

      <MultiSelect
        label="Responsáveis"
        options={peopleOptions}
        selected={processForm.responsiblePeople || []}
        onChange={(val) =>
          setProcessForm({ ...processForm, responsiblePeople: val })
        }
        searchValue={peopleSearch}
        onSearchValueChange={setPeopleSearch}
        loading={peopleQuery.isFetching}
        placeholder='Buscar por "name"...'
      />

      <MultiSelect
        label="Documentos"
        options={documentOptions}
        selected={processForm.documents || []}
        onChange={(val) => setProcessForm({ ...processForm, documents: val })}
        searchValue={docSearch}
        onSearchValueChange={setDocSearch}
        loading={docsQuery.isFetching}
        placeholder='Buscar por "title"...'
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={() => setEditingProcess(false)}>
          Cancelar
        </Button>

        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  );
}