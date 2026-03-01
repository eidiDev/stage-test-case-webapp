import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Plus, Save, Trash2, ChevronRight, ChevronDown,
  Settings, UserCheck, ChevronsDownUp, ChevronsUpDown,
  AlertTriangle,
} from 'lucide-react';
import { ProcessStatus, ProcessType, ProcessPriority } from '@/types';
import { format } from 'date-fns';

interface TreeProcess {
  id: string;
  name: string;
  description?: string;
  status: ProcessStatus;
  type: ProcessType;
  priority: ProcessPriority;
  is_active: boolean;
  area_id: string;
  parent_id: string | null;
  children: TreeProcess[];
  created_at: string;
  updated_at: string;
}

// Mock tree data
const mockProcesses: TreeProcess[] = [
  {
    id: '1', name: 'Gestão Financeira', status: ProcessStatus.ACTIVE, type: ProcessType.SYSTEM,
    priority: ProcessPriority.HIGH, is_active: true, area_id: '1', parent_id: null,
    created_at: '2024-01-10T10:00:00Z', updated_at: '2024-06-01T14:00:00Z',
    description: 'Processos financeiros principais',
    children: [
      {
        id: '1-1', name: 'Contas a Pagar', status: ProcessStatus.ACTIVE, type: ProcessType.MANUAL,
        priority: ProcessPriority.HIGH, is_active: true, area_id: '1', parent_id: '1',
        created_at: '2024-01-15T10:00:00Z', updated_at: '2024-06-01T14:00:00Z',
        children: [
          {
            id: '1-1-1', name: 'Aprovação de Pagamentos', status: ProcessStatus.CRITICAL, type: ProcessType.MANUAL,
            priority: ProcessPriority.HIGH, is_active: true, area_id: '1', parent_id: '1-1',
            created_at: '2024-02-01T10:00:00Z', updated_at: '2024-06-01T14:00:00Z', children: [],
          },
        ],
      },
      {
        id: '1-2', name: 'Contas a Receber', status: ProcessStatus.ACTIVE, type: ProcessType.SYSTEM,
        priority: ProcessPriority.MEDIUM, is_active: true, area_id: '1', parent_id: '1',
        created_at: '2024-01-20T10:00:00Z', updated_at: '2024-06-01T14:00:00Z', children: [],
      },
    ],
  },
  {
    id: '2', name: 'Gestão de Pessoas', status: ProcessStatus.IN_REVIEW, type: ProcessType.MANUAL,
    priority: ProcessPriority.MEDIUM, is_active: true, area_id: '2', parent_id: null,
    created_at: '2024-02-10T08:00:00Z', updated_at: '2024-05-20T09:00:00Z',
    description: 'Processos de RH',
    children: [
      {
        id: '2-1', name: 'Recrutamento', status: ProcessStatus.ACTIVE, type: ProcessType.MANUAL,
        priority: ProcessPriority.MEDIUM, is_active: true, area_id: '2', parent_id: '2',
        created_at: '2024-02-15T08:00:00Z', updated_at: '2024-05-20T09:00:00Z', children: [],
      },
      {
        id: '2-2', name: 'Onboarding', status: ProcessStatus.ACTIVE, type: ProcessType.SYSTEM,
        priority: ProcessPriority.LOW, is_active: true, area_id: '2', parent_id: '2',
        created_at: '2024-03-01T08:00:00Z', updated_at: '2024-05-20T09:00:00Z', children: [],
      },
    ],
  },
  {
    id: '3', name: 'Gestão de TI', status: ProcessStatus.ACTIVE, type: ProcessType.SYSTEM,
    priority: ProcessPriority.HIGH, is_active: true, area_id: '3', parent_id: null,
    created_at: '2024-03-05T12:00:00Z', updated_at: '2024-06-10T16:00:00Z',
    description: 'Processos de tecnologia',
    children: [
      {
        id: '3-1', name: 'Deploy', status: ProcessStatus.CRITICAL, type: ProcessType.SYSTEM,
        priority: ProcessPriority.HIGH, is_active: true, area_id: '3', parent_id: '3',
        created_at: '2024-03-10T12:00:00Z', updated_at: '2024-06-10T16:00:00Z', children: [],
      },
    ],
  },
];

const areas = [
  { id: '1', name: 'Financeiro' },
  { id: '2', name: 'RH' },
  { id: '3', name: 'TI' },
  { id: '4', name: 'Operações' },
];

function hasCriticalChild(node: TreeProcess): boolean {
  if (node.status === ProcessStatus.CRITICAL) return true;
  return node.children.some(hasCriticalChild);
}

function StatusBadge({ status }: { status: ProcessStatus }) {
  const cls = status === ProcessStatus.ACTIVE ? 'badge-status-active'
    : status === ProcessStatus.IN_REVIEW ? 'badge-status-review'
    : 'badge-status-critical';
  const label = status === ProcessStatus.ACTIVE ? 'Ativo'
    : status === ProcessStatus.IN_REVIEW ? 'Revisão'
    : 'Crítico';
  return <span className={cls}>{label}</span>;
}

function PriorityBadge({ priority }: { priority: ProcessPriority }) {
  const cls = priority === ProcessPriority.HIGH ? 'badge-priority-high'
    : priority === ProcessPriority.MEDIUM ? 'badge-priority-medium'
    : 'badge-priority-low';
  return <span className={cls}>{priority}</span>;
}

function TypeIcon({ type }: { type: ProcessType }) {
  return type === ProcessType.SYSTEM
    ? <Settings className="w-3.5 h-3.5 text-type-system" />
    : <UserCheck className="w-3.5 h-3.5 text-type-manual" />;
}

// Tree Node Component
function TreeNode({
  node, level, selected, onSelect, expanded, onToggle, onAddChild, onDelete,
}: {
  node: TreeProcess; level: number; selected: string | null;
  onSelect: (n: TreeProcess) => void; expanded: Set<string>;
  onToggle: (id: string) => void; onAddChild: (parent: TreeProcess) => void;
  onDelete: (id: string) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = selected === node.id;
  const hasCritical = hasCriticalChild(node) && node.status !== ProcessStatus.CRITICAL;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors hover:bg-accent ${
          isSelected ? 'bg-accent text-accent-foreground' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
          className="w-4 h-4 flex items-center justify-center"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : <span className="w-3.5" />}
        </button>

        <TypeIcon type={node.type} />

        <span className="flex-1 truncate font-medium">{node.name}</span>

        {hasCritical && (
          <AlertTriangle className="w-3 h-3 text-status-critical opacity-60" />
        )}

        <StatusBadge status={node.status} />
        <PriorityBadge priority={node.priority} />

        {/* Hover actions */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
            className="p-0.5 rounded hover:bg-primary/10"
            title="Adicionar subprocesso"
          >
            <Plus className="w-3 h-3 text-primary" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="p-0.5 rounded hover:bg-destructive/10"
            title="Excluir"
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 border-l-2 border-border" style={{ marginLeft: `${level * 20 + 18}px` }} />
          {node.children.map((child) => (
            <TreeNode
              key={child.id} node={child} level={level + 1}
              selected={selected} onSelect={onSelect} expanded={expanded}
              onToggle={onToggle} onAddChild={onAddChild} onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Breadcrumb
function Breadcrumb({ node, allNodes }: { node: TreeProcess; allNodes: TreeProcess[] }) {
  const path: string[] = [];
  const findPath = (nodes: TreeProcess[], targetId: string, current: string[]): boolean => {
    for (const n of nodes) {
      if (n.id === targetId) { path.push(...current, n.name); return true; }
      if (findPath(n.children, targetId, [...current, n.name])) return true;
    }
    return false;
  };
  findPath(allNodes, node.id, []);

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <span>Processos</span>
      {path.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          <span className={i === path.length - 1 ? 'text-foreground font-medium' : ''}>{p}</span>
        </span>
      ))}
    </div>
  );
}

// Children Builder (for CREATE mode)
interface ChildDraft {
  name: string;
  type: ProcessType;
  priority: ProcessPriority;
  status: ProcessStatus;
  children: ChildDraft[];
}

function ChildBuilder({ children: drafts, onChange, level = 0 }: {
  children: ChildDraft[]; onChange: (c: ChildDraft[]) => void; level?: number;
}) {
  const addChild = () => {
    onChange([...drafts, { name: '', type: ProcessType.MANUAL, priority: ProcessPriority.MEDIUM, status: ProcessStatus.ACTIVE, children: [] }]);
  };

  const removeChild = (i: number) => {
    onChange(drafts.filter((_, idx) => idx !== i));
  };

  const updateChild = (i: number, key: string, value: any) => {
    const next = [...drafts];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {drafts.map((child, i) => (
        <div key={i} className="border border-border rounded-md p-3 bg-muted/20" style={{ marginLeft: `${level * 16}px` }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">└─</span>
            <Input
              placeholder="Nome do subprocesso"
              value={child.name}
              onChange={(e) => updateChild(i, 'name', e.target.value)}
              className="h-7 text-sm flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeChild(i)} className="h-7 w-7 p-0">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Select value={child.type} onValueChange={(v) => updateChild(i, 'type', v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={child.priority} onValueChange={(v) => updateChild(i, 'priority', v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={child.status} onValueChange={(v) => updateChild(i, 'status', v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="IN_REVIEW">Revisão</SelectItem>
                <SelectItem value="CRITICAL">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => updateChild(i, 'children', [...child.children, { name: '', type: ProcessType.MANUAL, priority: ProcessPriority.MEDIUM, status: ProcessStatus.ACTIVE, children: [] }])} className="h-6 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Sub-filho
          </Button>
          {child.children.length > 0 && (
            <ChildBuilder children={child.children} onChange={(c) => updateChild(i, 'children', c)} level={level + 1} />
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addChild} className="h-7 text-xs" style={{ marginLeft: `${level * 16}px` }}>
        <Plus className="w-3 h-3 mr-1" /> Adicionar subprocesso
      </Button>
    </div>
  );
}

export default function Processes() {
  const [processes] = useState<TreeProcess[]>(mockProcesses);
  const [selected, setSelected] = useState<TreeProcess | null>(null);
  const [mode, setMode] = useState<'update' | 'create-root' | 'create-child'>('update');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2', '3']));
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [childDrafts, setChildDrafts] = useState<ChildDraft[]>([]);
  const [parentForChild, setParentForChild] = useState<TreeProcess | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    const collect = (nodes: TreeProcess[]) => { nodes.forEach((n) => { all.add(n.id); collect(n.children); }); };
    collect(processes);
    setExpanded(all);
  };

  const collapseAll = () => setExpanded(new Set());

  const handleSelect = (node: TreeProcess) => {
    setSelected(node);
    setMode('update');
    setFormData({
      name: node.name,
      description: node.description || '',
      status: node.status,
      type: node.type,
      priority: node.priority,
      area_id: node.area_id,
    });
  };

  const handleNewRoot = () => {
    setSelected(null);
    setMode('create-root');
    setParentForChild(null);
    setFormData({ name: '', description: '', status: ProcessStatus.ACTIVE, type: ProcessType.MANUAL, priority: ProcessPriority.MEDIUM, area_id: '' });
    setChildDrafts([]);
  };

  const handleAddChild = (parent: TreeProcess) => {
    setSelected(null);
    setMode('create-child');
    setParentForChild(parent);
    setFormData({ name: '', description: '', status: ProcessStatus.ACTIVE, type: ProcessType.MANUAL, priority: ProcessPriority.MEDIUM, area_id: parent.area_id });
    setChildDrafts([]);
  };

  // Filter tree
  const filterTree = (nodes: TreeProcess[], query: string): TreeProcess[] => {
    if (!query) return nodes;
    return nodes.reduce<TreeProcess[]>((acc, node) => {
      const match = node.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = filterTree(node.children, query);
      if (match || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredProcesses = useMemo(() => filterTree(processes, search), [processes, search]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Processos</h1>
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
        {/* Left Tree */}
        <div className="col-span-4 crud-panel flex flex-col">
          <div className="panel-header flex items-center justify-between">
            <span>Árvore de Processos</span>
            <div className="flex items-center gap-1">
              <button onClick={expandAll} className="p-1 rounded hover:bg-accent" title="Expandir tudo">
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={collapseAll} className="p-1 rounded hover:bg-accent" title="Recolher tudo">
                <ChevronsDownUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar processos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto py-1">
            {filteredProcesses.map((node) => (
              <TreeNode
                key={node.id} node={node} level={0} selected={selected?.id || null}
                onSelect={handleSelect} expanded={expanded} onToggle={toggleExpand}
                onAddChild={handleAddChild} onDelete={() => {}}
              />
            ))}
          </div>
          <div className="p-2 border-t border-border">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleNewRoot}>
              <Plus className="w-3 h-3 mr-1" /> Novo Processo Raiz
            </Button>
          </div>
        </div>

        {/* Mid Editor */}
        <div className="col-span-5 crud-panel flex flex-col">
          <div className="panel-header">
            {mode === 'update' ? 'Editar Processo' : mode === 'create-child' ? 'Novo Subprocesso' : 'Novo Processo Raiz'}
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {mode === 'update' && selected && (
              <Breadcrumb node={selected} allNodes={processes} />
            )}

            {mode === 'create-child' && parentForChild && (
              <div className="text-xs text-muted-foreground bg-accent/50 p-2 rounded-md">
                Pai: <span className="font-medium text-foreground">{parentForChild.name}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nome</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-9 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Descrição</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="IN_REVIEW">Em Revisão</SelectItem>
                    <SelectItem value="CRITICAL">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM">System</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="LOW">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Área</Label>
              <Select
                value={formData.area_id}
                onValueChange={(v) => setFormData({ ...formData, area_id: v })}
                disabled={mode === 'create-child'}
              >
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Children builder - only for create modes */}
            {(mode === 'create-root' || mode === 'create-child') && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-xs font-medium">Subprocessos</Label>
                <ChildBuilder children={childDrafts} onChange={setChildDrafts} />
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="col-span-3 crud-panel flex flex-col">
          <div className="panel-header">Ações</div>
          <div className="p-4 space-y-3">
            {mode === 'update' ? (
              <>
                <Button className="w-full justify-start">
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleNewRoot}>
                  <Plus className="w-4 h-4 mr-2" /> Novo
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" /> Criar
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleNewRoot}>
                  <Plus className="w-4 h-4 mr-2" /> Limpar
                </Button>
                <Button variant="destructive" className="w-full justify-start" disabled>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </>
            )}
          </div>

          {mode === 'update' && selected && (
            <div className="mt-auto p-4 border-t border-border text-xs text-muted-foreground space-y-1">
              <p>ID: {selected.id}</p>
              <p>Criado: {format(new Date(selected.created_at), 'dd/MM/yyyy HH:mm')}</p>
              <p>Atualizado: {format(new Date(selected.updated_at), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
