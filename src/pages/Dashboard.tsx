import {
  GitBranch, MapPin, Users, FileText, AlertTriangle, CheckCircle,
  Settings, UserCheck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const metrics = [
  { label: 'Processos', value: 47, icon: GitBranch, color: 'text-primary' },
  { label: 'Ativos', value: 32, icon: CheckCircle, color: 'text-status-active' },
  { label: 'Críticos', value: 5, icon: AlertTriangle, color: 'text-status-critical' },
  { label: 'Áreas', value: 8, icon: MapPin, color: 'text-primary' },
  { label: 'Pessoas', value: 24, icon: Users, color: 'text-primary' },
  { label: 'Documentos', value: 63, icon: FileText, color: 'text-primary' },
];

const statusData = [
  { name: 'Ativo', value: 32, color: 'hsl(142, 71%, 45%)' },
  { name: 'Em Revisão', value: 10, color: 'hsl(38, 92%, 50%)' },
  { name: 'Crítico', value: 5, color: 'hsl(0, 84%, 60%)' },
];

const priorityData = [
  { name: 'Alta', system: 8, manual: 5 },
  { name: 'Média', system: 12, manual: 9 },
  { name: 'Baixa', system: 7, manual: 6 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-metric">
            <div className="flex items-center justify-between mb-3">
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie */}
        <div className="card-metric">
          <h3 className="font-semibold text-foreground mb-4">Processos por Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar */}
        <div className="card-metric">
          <h3 className="font-semibold text-foreground mb-4">Prioridade por Tipo</h3>
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Settings className="w-3 h-3 text-type-system" /> System
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-type-manual" /> Manual
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="system" fill="hsl(215, 70%, 50%)" radius={[4, 4, 0, 0]} name="System" />
              <Bar dataKey="manual" fill="hsl(270, 60%, 55%)" radius={[4, 4, 0, 0]} name="Manual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
