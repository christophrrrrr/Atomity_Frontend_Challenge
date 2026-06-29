import { formatCurrency } from "@/lib/format";
import { RESOURCES } from "@/lib/resources";
import type { CostNode } from "@/lib/types";
import { EfficiencyMeter } from "./EfficiencyMeter";

/** A single data row: entity name + per-resource costs + efficiency + total. */
export function CostTableRow({ node }: { node: CostNode }) {
  return (
    <tr className="border-t border-line transition-colors hover:bg-surface-2">
      <th
        scope="row"
        className="whitespace-nowrap px-4 py-3 text-start font-medium text-ink"
      >
        {node.name}
      </th>
      {RESOURCES.map((resource) => (
        <td
          key={resource.key}
          className="px-4 py-3 text-end tabular-nums text-ink-2"
        >
          {formatCurrency(node.metrics[resource.key])}
        </td>
      ))}
      <td className="px-4 py-3 text-end">
        <EfficiencyMeter value={node.metrics.efficiency} />
      </td>
      <td className="px-4 py-3 text-end font-semibold tabular-nums text-ink">
        {formatCurrency(node.metrics.total)}
      </td>
    </tr>
  );
}
