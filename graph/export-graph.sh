#!/bin/bash
# Export shamash.db to readable markdown for git tracking
# Run after each session: bash graph/export-graph.sh

DB="$HOME/.eden/shamash.db"
OUT="$(dirname "$0")/shamash-graph.md"

{
echo "# Shamash Graph Export"
echo ""
echo "Exported: $(date -u '+%Y-%m-%d %H:%M UTC')"
echo ""
echo "---"
echo ""

# Memes - generate markdown directly in SQL
sqlite3 "$DB" "
  SELECT
    CASE WHEN row_num = 1 THEN '## ' || domain || char(10) || char(10) ELSE '' END ||
    '### ' || id || ': ' || label || char(10) || char(10) ||
    text || char(10) || char(10) ||
    '*source: ' || source_kind || ' -- scope: ' || scope || '*' || char(10)
  FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY domain ORDER BY CAST(SUBSTR(id, 6) AS INTEGER)) as row_num
    FROM memes
    ORDER BY domain, CAST(SUBSTR(id, 6) AS INTEGER)
  );
"

echo ""
echo "---"
echo ""
echo "## Edges"
echo ""
echo "| Source | Type | Target |"
echo "|---|---|---|"

sqlite3 "$DB" "
  SELECT '| ' || m1.label || ' | ' || e.edge_type || ' | ' || m2.label || ' |'
  FROM edges e
  JOIN memes m1 ON e.src_id = m1.id
  JOIN memes m2 ON e.dst_id = m2.id
  ORDER BY CAST(REPLACE(REPLACE(e.id, 'edge-', ''), 'edge-humor-seinfeld-encoding', '999') AS INTEGER);
"

} > "$OUT"

echo "Exported to $OUT"
echo "$(sqlite3 "$DB" 'SELECT COUNT(*) FROM memes;') memes, $(sqlite3 "$DB" 'SELECT COUNT(*) FROM edges;') edges"
