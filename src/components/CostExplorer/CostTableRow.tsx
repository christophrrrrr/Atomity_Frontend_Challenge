import { AnimatedNumber } from "@/components/primitives/AnimatedNumber";
import { formatCurrency } from "@/lib/format";
import { RESOURCES } from "@/lib/resources";
import type { CostNode } from "@/lib/types";
import { EfficiencyMeter } from "./EfficiencyMeter";

/** A single data row: entity name + per-resource costs + efficiency + total. */
export function CostTableRow({
  node,
  isHighlighted,
  onHover,
  canDrill,
  onSelect,
}: {
  node: CostNode;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  canDrill: boolean;
  onSelect: (node: CostNode) => void;
}) {
  return (
    <tr
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className={`border-t border-line transition-colors ${
        isHighlighted ? "bg-surface-2" : ""
      }`}
    >
      <th
        scope="row"
        className="whitespace-nowrap px-4 py-3 text-start font-medium text-ink"
      >
        {canDrill ? (
          <button
            type="button"
            onClick={() => onSelect(node)}
            className="group/name inline-flex items-center gap-1 rounded text-ink transition-colors hover:text-brand"
          >
            <span>{node.name}</span>
            <svg
              viewBox="0 0 24 24"
              className="size-3.5 text-ink-3 transition-colors group-hover/name:text-brand"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          node.name
        )}
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
        <AnimatedNumber value={node.metrics.total} format={formatCurrency} />
      </td>
    </tr>
  );
}
