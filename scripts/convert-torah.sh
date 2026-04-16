#!/bin/bash
# Convert all .docx torah files from ~/Working to markdown in torah-writing/
# Uses bash for Hebrew path handling, Python for docx conversion

WORKING="$HOME/Working"
DEST="$HOME/docs/the-verge-of-redemption/torah-writing"
CONVERTER="$HOME/docs/the-verge-of-redemption/docx2md.py"

# Map Hebrew directory names to English
declare -A MAP
MAP["להכניס בלב"]="lehachnis-balev/working-archive"
MAP["סוד המנורה"]="sod-hamenura"
MAP["עיקר הצדיק"]="ikar-hatzadik"
MAP["סיפורי מעשיות"]="sipurei-maasiyot"
MAP["הרב מלכה שלום בית"]="harav-malka"
MAP["הרב עופר"]="harav-ofer"
MAP["ימות המשיח"]="yemot-hamashiach"
MAP["שיחת חברים"]="sichat-chaverim"
MAP["אברך מהקהילה"]="avrech-mehakehila"
MAP["טיוטות"]="drafts"
MAP["חוברת על התורה"]="choveret-al-hatorah"
MAP["תמלול שיעורי הרב"]="timlul-shiurei-harav"

total=0

# Process כתיבה תורנית
KTIVA="$WORKING/כתיבה תורנית"
if [ -d "$KTIVA" ]; then
    echo "=== כתיבה תורנית ==="
    for dir in "$KTIVA"/*/; do
        dirname=$(basename "$dir")
        eng="${MAP[$dirname]}"
        if [ -z "$eng" ]; then
            echo "  UNMAPPED: $dirname"
            continue
        fi
        dest_dir="$DEST/$eng"
        echo ""
        echo "--- $eng ---"

        # Find all .docx files recursively
        find "$dir" -name "*.docx" -not -name "~*" | while read -r docx; do
            # Build relative path
            rel="${docx#$dir}"
            md_rel="${rel%.docx}.md"
            md_path="$dest_dir/$md_rel"

            # Skip if exists
            if [ -f "$md_path" ]; then
                continue
            fi

            # Create parent dir
            mkdir -p "$(dirname "$md_path")"

            # Convert
            if python3 "$CONVERTER" "$docx" "$md_path" 2>/dev/null; then
                echo "  OK: $md_rel"
                total=$((total + 1))
            else
                echo "  ERR: $md_rel"
            fi
        done
    done
fi

# Process חומר תורני (modern format only)
CHOMER="$WORKING/חומר תורני"
if [ -d "$CHOMER" ]; then
    echo ""
    echo "=== חומר תורני ==="
    for dir in "$CHOMER"/*/; do
        dirname=$(basename "$dir")
        eng="${MAP[$dirname]}"
        if [ -z "$eng" ]; then
            echo "  UNMAPPED: $dirname"
            continue
        fi
        dest_dir="$DEST/$eng"
        echo ""
        echo "--- $eng ---"

        find "$dir" -name "*.docx" -not -name "~*" | while read -r docx; do
            rel="${docx#$dir}"
            md_rel="${rel%.docx}.md"
            md_path="$dest_dir/$md_rel"

            if [ -f "$md_path" ]; then
                continue
            fi

            mkdir -p "$(dirname "$md_path")"

            if python3 "$CONVERTER" "$docx" "$md_path" 2>/dev/null; then
                echo "  OK: $md_rel"
            else
                echo "  ERR: $md_rel"
            fi
        done
    done
fi

echo ""
echo "=== Done ==="
