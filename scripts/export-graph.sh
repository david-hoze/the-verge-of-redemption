#!/bin/bash
# Export EDEN graph from SQLite to tracked markdown
# Runs before commit so graph state is versioned even though .eden/ is gitignored

REPO="$(cd "$(dirname "$0")" && pwd)"
DB="$REPO/.eden/shamash.db"
OUT="$REPO/.eden-graph.md"

if [ ! -f "$DB" ]; then
  echo "No graph database at $DB"
  exit 0
fi

cat > "$OUT" <<'HEADER'
# EDEN Graph Export

Auto-generated from `.eden/shamash.db`. Do not edit directly.

HEADER

# Memes
echo "## Memes" >> "$OUT"
echo "" >> "$OUT"

sqlite3 "$DB" -separator '|' "SELECT id, label, domain, source_kind, text FROM memes ORDER BY domain, label;" | while IFS='|' read -r id label domain source text; do
  echo "### $label" >> "$OUT"
  echo "*${domain} | ${source} | ${id}*" >> "$OUT"
  echo "" >> "$OUT"
  echo "$text" >> "$OUT"
  echo "" >> "$OUT"
  echo "---" >> "$OUT"
  echo "" >> "$OUT"
done

# Edges
echo "## Edges" >> "$OUT"
echo "" >> "$OUT"
echo "| Source | Type | Target |" >> "$OUT"
echo "|--------|------|--------|" >> "$OUT"

sqlite3 "$DB" -separator '|' "
  SELECT m1.label, e.edge_type, m2.label
  FROM edges e
  JOIN memes m1 ON e.src_id = m1.id
  JOIN memes m2 ON e.dst_id = m2.id
  ORDER BY m1.label, e.edge_type;
" | while IFS='|' read -r src etype dst; do
  echo "| $src | $etype | $dst |" >> "$OUT"
done

echo "" >> "$OUT"
echo "*Exported: $(date -u '+%Y-%m-%d %H:%M:%S UTC')*" >> "$OUT"

# Stage the export
git -C "$REPO" add "$OUT"
