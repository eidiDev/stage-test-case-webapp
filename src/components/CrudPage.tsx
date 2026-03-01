import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Save, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'boolean';
  required?: boolean;
}

interface CrudPageProps {
  title: string;
  fields: FieldConfig[];
  mockData: any[];
}

export default function CrudPage({ title, fields, mockData }: CrudPageProps) {
  const [items, setItems] = useState<any[]>(mockData);
  const [selected, setSelected] = useState<any | null>(null);
  const [mode, setMode] = useState<'update' | 'create'>('update');
  const [formData, setFormData] = useState<any>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (items.length > 0 && !selected) {
      setSelected(items[0]);
      setFormData(items[0]);
      setMode('update');
    }
  }, [items]);

  useEffect(() => {
    if (selected) {
      setFormData(selected);
      setMode('update');
    }
  }, [selected]);

  const filteredItems = items.filter((item) =>
    Object.values(item).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleNew = () => {
    setMode('create');
    setSelected(null);
    const empty: any = {};
    fields.forEach((f) => {
      empty[f.key] = f.type === 'boolean' ? true : '';
    });
    setFormData(empty);
  };

  const handleSave = () => {
    if (mode === 'create') {
      const newItem = {
        ...formData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setItems([...items, newItem]);
      setSelected(newItem);
      setMode('update');
    } else {
      setItems(items.map((i) => (i.id === selected.id ? { ...formData, updated_at: new Date().toISOString() } : i)));
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    const next = items.filter((i) => i.id !== selected.id);
    setItems(next);
    setSelected(next[0] || null);
    if (next.length === 0) handleNew();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
        {/* Left List */}
        <div className="col-span-4 crud-panel flex flex-col">
          <div className="panel-header flex items-center justify-between">
            <span>Registros</span>
            <span className="text-xs text-muted-foreground">{filteredItems.length}</span>
          </div>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left px-4 py-3 border-b border-border text-sm transition-colors hover:bg-accent/50 ${
                  selected?.id === item.id ? 'bg-accent' : ''
                }`}
              >
                <div className="font-medium text-foreground truncate">
                  {item.name || item.title || item.email}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className={item.is_active ? 'badge-status-active' : 'badge-status-critical'}>
                    {item.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span>{format(new Date(item.created_at), 'dd/MM/yy')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mid Form */}
        <div className="col-span-5 crud-panel flex flex-col">
          <div className="panel-header">
            {mode === 'create' ? 'Novo Registro' : 'Editar Registro'}
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">{field.label}</Label>
                {field.type === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData[field.key] ?? true}
                      onCheckedChange={(v) => setFormData({ ...formData, [field.key]: v })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData[field.key] ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                ) : (
                  <Input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="h-9 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="col-span-3 crud-panel flex flex-col">
          <div className="panel-header">Ações</div>
          <div className="p-4 space-y-3">
            {mode === 'update' ? (
              <>
                <Button className="w-full justify-start" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleNew}>
                  <Plus className="w-4 h-4 mr-2" /> Novo
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start" onClick={handleSave}>
                  <Plus className="w-4 h-4 mr-2" /> Criar
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleNew}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Limpar
                </Button>
                <Button variant="destructive" className="w-full justify-start" disabled>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </>
            )}
          </div>

          {mode === 'update' && selected && (
            <div className="mt-auto p-4 border-t border-border text-xs text-muted-foreground space-y-1">
              <p>ID: {selected.id?.slice(0, 8)}...</p>
              <p>Criado: {format(new Date(selected.created_at), 'dd/MM/yyyy HH:mm')}</p>
              <p>Atualizado: {format(new Date(selected.updated_at), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
