#!/bin/bash
# Convert .doc files from zips using antiword

WORKING="$HOME/Working"
DEST="$HOME/docs/the-verge-of-redemption/torah-writing"
TMP="/tmp/torah-doc"

rm -rf "$TMP"
mkdir -p "$TMP"

total=0

declare -A ZIP_MAP
ZIP_MAP["$WORKING/זמני/חידושים בהלכה.zip"]="chidushim-behalacha"
ZIP_MAP["$WORKING/זמני/לא ממוין.zip"]="unsorted"
ZIP_MAP["$WORKING/זמני/ליקוטי מוהרן.zip"]="likutey-moharan-notes"
ZIP_MAP["$WORKING/זמני/שיחת חברים.zip"]="sichat-chaverim"
ZIP_MAP["$WORKING/זמני/תורה חדשה.zip"]="torah-chadasha"
ZIP_MAP["$WORKING/זמני/תפילה לאהבה ואחדות.zip"]="tefila-ahava-veachdut"
ZIP_MAP["$WORKING/זמני/גיליון 3 - להרים את הפירורים.zip"]="lehachnis-balev/working-archive/gilayon-3"

for zip_path in "${!ZIP_MAP[@]}"; do
    dest_name="${ZIP_MAP[$zip_path]}"
    dest_dir="$DEST/$dest_name"
    zip_name=$(basename "$zip_path")

    echo ""
    echo "=== $dest_name ==="

    if [ ! -f "$zip_path" ]; then
        echo "  SKIP: zip not found"
        continue
    fi

    extract_dir="$TMP/$dest_name"
    mkdir -p "$extract_dir"
    unzip -o -q "$zip_path" -d "$extract_dir" 2>/dev/null

    find "$extract_dir" -name "*.doc" -not -name "*.docx" -not -name "~*" | while read -r doc; do
        rel="${doc#$extract_dir/}"
        md_rel="${rel%.doc}.md"
        md_path="$dest_dir/$md_rel"

        if [ -f "$md_path" ]; then
            continue
        fi

        mkdir -p "$(dirname "$md_path")"

        if antiword -m UTF-8.txt "$doc" > "$md_path" 2>/dev/null; then
            # Check if file has content
            if [ -s "$md_path" ]; then
                echo "  OK: $md_rel"
            else
                echo "  EMPTY: $md_rel"
                rm "$md_path"
            fi
        else
            echo "  ERR: $md_rel"
            rm -f "$md_path"
        fi
    done
done

# Also convert .doc files from the main Working directories that weren't in zips
echo ""
echo "=== Direct .doc files in כתיבה תורנית ==="
KTIVA="$WORKING/כתיבה תורנית"
if [ -d "$KTIVA" ]; then
    find "$KTIVA" -name "*.doc" -not -name "*.docx" -not -name "~*" | while read -r doc; do
        # Figure out which subdir
        rel="${doc#$KTIVA/}"
        # Get first component
        subdir=$(echo "$rel" | cut -d'/' -f1)

        case "$subdir" in
            "להכניס בלב") eng="lehachnis-balev/working-archive" ;;
            "סוד המנורה") eng="sod-hamenura" ;;
            "עיקר הצדיק") eng="ikar-hatzadik" ;;
            "סיפורי מעשיות") eng="sipurei-maasiyot" ;;
            "הרב מלכה שלום בית") eng="harav-malka" ;;
            "הרב עופר") eng="harav-ofer" ;;
            "ימות המשיח") eng="yemot-hamashiach" ;;
            "שיחת חברים") eng="sichat-chaverim" ;;
            "אברך מהקהילה") eng="avrech-mehakehila" ;;
            "טיוטות") eng="drafts" ;;
            *) eng="other"; echo "  UNMAPPED: $subdir" ;;
        esac

        # Build path within subdir
        inner_rel="${rel#$subdir/}"
        md_rel="${inner_rel%.doc}.md"
        md_path="$DEST/$eng/$md_rel"

        if [ -f "$md_path" ]; then
            continue
        fi

        mkdir -p "$(dirname "$md_path")"

        if antiword -m UTF-8.txt "$doc" > "$md_path" 2>/dev/null; then
            if [ -s "$md_path" ]; then
                echo "  OK ($eng): $md_rel"
            else
                rm "$md_path"
            fi
        else
            rm -f "$md_path"
        fi
    done
fi

rm -rf "$TMP"
echo ""
echo "=== Done ==="
