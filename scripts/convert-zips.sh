#!/bin/bash
# Extract zip files and convert .docx to markdown
# .doc files (old format) are noted but can't be converted with python-docx

WORKING="$HOME/Working"
DEST="$HOME/docs/the-verge-of-redemption/torah-writing"
CONVERTER="$HOME/docs/the-verge-of-redemption/docx2md.py"
TMP="/tmp/torah-zips"

rm -rf "$TMP"
mkdir -p "$TMP"

total_docx=0
total_doc=0

# Map zip sources to destinations
declare -A ZIP_MAP
ZIP_MAP["$WORKING/כתיבה תורנית/חוברת על התורה/תורה מט/חומר גלם.zip"]="choveret-al-hatorah/torah-49-raw"
ZIP_MAP["$WORKING/כתיבה תורנית/חוברת על התורה/תורה מט/מקורות ערוכים.zip"]="choveret-al-hatorah/torah-49-sources"
ZIP_MAP["$WORKING/זמני/אור זרוע לצדיק.zip"]="or-zarua-latzadik"
ZIP_MAP["$WORKING/זמני/גיליון 3 - להרים את הפירורים.zip"]="lehachnis-balev/working-archive/gilayon-3"
ZIP_MAP["$WORKING/זמני/חידושים בהלכה.zip"]="chidushim-behalacha"
ZIP_MAP["$WORKING/זמני/לא ממוין.zip"]="unsorted"
ZIP_MAP["$WORKING/זמני/ליקוטי מוהרן.zip"]="likutey-moharan-notes"
ZIP_MAP["$WORKING/זמני/שיחת חברים.zip"]="sichat-chaverim"
ZIP_MAP["$WORKING/זמני/תורה חדשה.zip"]="torah-chadasha"
ZIP_MAP["$WORKING/זמני/תפילה לאהבה ואחדות.zip"]="tefila-ahava-veachdut"

for zip_path in "${!ZIP_MAP[@]}"; do
    dest_name="${ZIP_MAP[$zip_path]}"
    dest_dir="$DEST/$dest_name"
    zip_name=$(basename "$zip_path")

    echo ""
    echo "=== $dest_name ==="
    echo "  From: $zip_name"

    if [ ! -f "$zip_path" ]; then
        echo "  SKIP: zip not found"
        continue
    fi

    # Extract to temp
    extract_dir="$TMP/$dest_name"
    mkdir -p "$extract_dir"
    unzip -o -q "$zip_path" -d "$extract_dir" 2>/dev/null

    # Convert .docx files
    find "$extract_dir" -name "*.docx" -not -name "~*" | while read -r docx; do
        rel="${docx#$extract_dir/}"
        # Remove any top-level folder that duplicates the zip name
        md_rel="${rel%.docx}.md"
        md_path="$dest_dir/$md_rel"

        if [ -f "$md_path" ]; then
            continue
        fi

        mkdir -p "$(dirname "$md_path")"

        if python3 "$CONVERTER" "$docx" "$md_path" 2>/dev/null; then
            echo "  OK (docx): $md_rel"
            total_docx=$((total_docx + 1))
        else
            echo "  ERR (docx): $md_rel"
        fi
    done

    # List .doc files (can't convert with python-docx)
    find "$extract_dir" -name "*.doc" -not -name "*.docx" -not -name "~*" | while read -r doc; do
        rel="${doc#$extract_dir/}"
        echo "  SKIP (.doc): $rel"
        total_doc=$((total_doc + 1))
    done
done

echo ""
echo "=== Done ==="
echo "Converted .docx: $total_docx"
echo "Skipped .doc (old format): $total_doc"

# Clean up
rm -rf "$TMP"
