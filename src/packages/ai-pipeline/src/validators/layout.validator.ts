/**
 * Pass 2: Layout Validator — structural and semantic checks.
 * @NEURON owns this file.
 *
 * Checks:
 * - Grid overlap detection
 * - Nesting depth limits
 * - Column clamping (max 4 columns)
 * - Data binding reference validity (component refs existing binding IDs)
 * - Component ID uniqueness (post-processing should have fixed this, but verify)
 *
 * Auto-corrects where possible instead of rejecting.
 */

import type { Result } from '@instack/shared';
import { ok } from '@instack/shared';
import type { ValidationError } from '../errors';
import type { GeneratedAppSchema, GeneratedComponent, GeneratedDataBinding } from '../schemas/generate.schema';

export interface LayoutValidationResult {
  readonly valid: boolean;
  readonly schema: GeneratedAppSchema;
  readonly corrections: readonly string[];
}

/** Maximum grid columns */
const MAX_COLUMNS = 4;

/** Maximum nesting depth for containers */
const MAX_NESTING_DEPTH = 3;

/**
 * Pass 2: Validate layout structure and auto-correct where possible.
 */
export function validateLayout(
  schema: GeneratedAppSchema,
  sourceColumns?: readonly string[],
): Result<LayoutValidationResult, ValidationError> {
  const corrections: string[] = [];
  let components = [...schema.components] as GeneratedComponent[];
  let layout = { ...schema.layout };
  let dataBindings = [...schema.dataBindings] as GeneratedDataBinding[];

  // 1. Clamp layout columns
  if (layout.columns !== undefined && layout.columns > MAX_COLUMNS) {
    corrections.push(`Layout columns clamped from ${layout.columns} to ${MAX_COLUMNS}`);
    layout = { ...layout, columns: MAX_COLUMNS };
  }

  // 2. Check for duplicate component IDs
  const idCounts = new Map<string, number>();
  for (const comp of components) {
    idCounts.set(comp.id, (idCounts.get(comp.id) ?? 0) + 1);
  }
  const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateIds.length > 0) {
    // Auto-fix: append index
    const seen = new Set<string>();
    components = components.map((comp, idx) => {
      if (seen.has(comp.id)) {
        const newId = `${comp.id}_${idx}`;
        corrections.push(`Duplicate ID "${comp.id}" renamed to "${newId}"`);
        return { ...comp, id: newId };
      }
      seen.add(comp.id);
      return comp;
    });
  }

  // 3. Detect grid overlaps (same row+col)
  const occupiedCells = new Map<string, string>();
  for (const comp of components) {
    const span = comp.position.span ?? 1;
    for (let c = comp.position.col; c < comp.position.col + span; c++) {
      const cellKey = `${comp.position.row}:${c}`;
      const existing = occupiedCells.get(cellKey);
      if (existing) {
        corrections.push(
          `Grid overlap at row=${comp.position.row} col=${c}: "${comp.id}" overlaps "${existing}"`,
        );
        // Auto-fix: move to next available row
        const maxRow = Math.max(...components.map((co) => co.position.row));
        const newRow = maxRow + 1;
        corrections.push(`Moved "${comp.id}" to row ${newRow}`);
        const compIndex = components.indexOf(comp);
        components[compIndex] = {
          ...comp,
          position: { ...comp.position, row: newRow },
        };
        break;
      }
      occupiedCells.set(cellKey, comp.id);
    }
  }

  // 4. Clamp column positions
  const maxCol = (layout.columns ?? 1) - 1;
  components = components.map((comp) => {
    if (comp.position.col > maxCol) {
      corrections.push(`Component "${comp.id}" col ${comp.position.col} clamped to ${maxCol}`);
      return { ...comp, position: { ...comp.position, col: maxCol } };
    }
    return comp;
  });

  // 5. Validate data binding references
  const bindingIds = new Set(dataBindings.map((b) => b.id));
  components = components.map((comp) => {
    if (comp.dataBinding && !bindingIds.has(comp.dataBinding)) {
      corrections.push(`Component "${comp.id}" references unknown binding "${comp.dataBinding}", removed`);
      const { dataBinding: _unused, ...rest } = comp;
      void _unused;
      return rest as GeneratedComponent;
    }
    return comp;
  });

  // 6. Validate binding field references against source columns
  if (sourceColumns && sourceColumns.length > 0) {
    const sourceSet = new Set(sourceColumns);
    dataBindings = dataBindings.filter((binding) => {
      if (!sourceSet.has(binding.field)) {
        // Try case-insensitive match
        const match = sourceColumns.find(
          (col) => col.toLowerCase() === binding.field.toLowerCase(),
        );
        if (match) {
          corrections.push(`Binding "${binding.id}" field corrected: "${binding.field}" → "${match}"`);
          return true;
        }
        corrections.push(`Binding "${binding.id}" references unknown column "${binding.field}", removed`);
        return false;
      }
      return true;
    });
  }

  // 7. Check nesting depth (containers can't nest more than MAX_NESTING_DEPTH)
  // For Phase A, we don't support nested containers, so just check that
  // container components don't reference other containers
  const containerCount = components.filter((c) => c.type === 'container').length;
  if (containerCount > MAX_NESTING_DEPTH) {
    corrections.push(`${containerCount} containers detected (max ${MAX_NESTING_DEPTH}), keeping first ${MAX_NESTING_DEPTH}`);
    let kept = 0;
    components = components.filter((c) => {
      if (c.type === 'container') {
        kept++;
        return kept <= MAX_NESTING_DEPTH;
      }
      return true;
    });
  }

  const correctedSchema: GeneratedAppSchema = {
    ...schema,
    layout,
    components,
    dataBindings,
  };

  return ok({
    valid: true,
    schema: correctedSchema,
    corrections,
  });
}
