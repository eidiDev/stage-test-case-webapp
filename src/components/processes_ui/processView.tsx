import { Badge } from "../ui/badge";

const statusMap: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const typeMap: Record<string, string> = {
  MANUAL: "bg-gray-100 text-gray-700",
  SYSTEM: "bg-blue-100 text-blue-700",
};

const priorityMap: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

function InfoRow({ label, value }: any) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{value || "-"}</div>
    </div>
  );
}

function InfoBadgeRow({
  label,
  value,
  map,
}: {
  label: string;
  value: string;
  map: Record<string, string>;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        {label}
      </div>

      {value ? (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${map[value]}`}
        >
          {value}
        </span>
      ) : (
        "-"
      )}
    </div>
  );
}

function RelationChips({ label, items = [] }: any) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        {label}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            Nenhum
          </span>
        ) : (
          items.map((item: any) => (
            <Badge key={item.id} variant="secondary">
              {item?.name || item?.title}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

export default function ProcessView({ tree }: { tree: any }) {
  return (
    <div className="space-y-6 text-sm">
      <InfoRow label="Área" value={tree.area?.name} />

      <InfoBadgeRow
        label="Tipo"
        value={tree.type}
        map={typeMap}
      />

      <InfoBadgeRow
        label="Status"
        value={tree.status}
        map={statusMap}
      />

      <InfoBadgeRow
        label="Prioridade"
        value={tree.priority}
        map={priorityMap}
      />

      <InfoRow label="Descrição" value={tree.description} />

      <RelationChips label="Ferramentas" items={tree.tools} />
      <RelationChips label="Responsáveis" items={tree.responsiblePeople} />
      <RelationChips label="Documentos" items={tree.documents} />
    </div>
  );
}