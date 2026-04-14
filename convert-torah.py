#!/usr/bin/env python3
"""Convert .docx files from ~/Working torah directories to markdown in torah-writing/
Uses structure-based discovery since Hebrew paths display garbled on MSYS2 terminal."""

import os
import sys
from docx import Document

WORKING = "C:/msys64/home/natanh/Working"
TORAH_WRITING = "C:/msys64/home/natanh/docs/the-verge-of-redemption/torah-writing"

# Map Hebrew dir names to English target names
# We'll discover these by listing and matching
DIR_MAP = {
    # כתיבה תורנית subdirectories
    "lehachnis-balev": "להכניס בלב",
    "sod-hamenura": "סוד המנורה",
    "ikar-hatzadik": "עיקר הצדיק",
    "sipurei-maasiyot": "סיפורי מעשיות",
    "harav-malka": "הרב מלכה שלום בית",
    "harav-ofer": "הרב עופר",
    "yemot-hamashiach": "ימות המשיח",
    "sichat-chaverim": "שיחת חברים",
    "avrech-mehakehila": "אברך מהקהילה",
    "drafts": "טיוטות",
    "choveret-al-hatorah": "חוברת על התורה",
    # חומר תורני subdirectories
    "timlul-shiurei-harav": "תמלול שיעורי הרב",
}


def docx_to_markdown(docx_path):
    """Convert a .docx file to markdown text."""
    try:
        doc = Document(docx_path)
    except Exception as e:
        return f"[Error reading file: {e}]"

    lines = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            lines.append("")
            continue

        style = para.style.name if para.style else ""
        if "Heading 1" in style or "1" in style and "כותרת" in style:
            lines.append(f"# {text}")
        elif "Heading 2" in style or "2" in style and "כותרת" in style:
            lines.append(f"## {text}")
        elif "Heading 3" in style or "3" in style and "כותרת" in style:
            lines.append(f"### {text}")
        elif "Title" in style:
            lines.append(f"# {text}")
        elif "Subtitle" in style:
            lines.append(f"## {text}")
        else:
            runs = para.runs
            if runs and all(r.bold for r in runs if r.text.strip()):
                lines.append(f"**{text}**")
            else:
                lines.append(text)
        lines.append("")

    # Clean multiple blank lines
    result = []
    prev_blank = False
    for line in lines:
        if line == "":
            if not prev_blank:
                result.append("")
            prev_blank = True
        else:
            result.append(line)
            prev_blank = False

    return "\n".join(result).strip() + "\n"


def find_hebrew_dir(parent, hebrew_name):
    """Find a directory by its Hebrew name within parent."""
    if not os.path.exists(parent):
        return None
    for entry in os.listdir(parent):
        full = os.path.join(parent, entry)
        if os.path.isdir(full) and entry == hebrew_name:
            return full
    return None


def convert_tree(src_dir, dest_dir):
    """Recursively convert all .docx files in src_dir to .md in dest_dir."""
    if not os.path.exists(src_dir):
        return 0

    os.makedirs(dest_dir, exist_ok=True)
    count = 0

    for root, dirs, files in os.walk(src_dir):
        for fname in sorted(files):
            if not fname.endswith(".docx"):
                continue
            if fname.startswith("~"):
                continue

            src_path = os.path.join(root, fname)
            # Build relative path
            rel = os.path.relpath(src_path, src_dir)
            md_rel = os.path.splitext(rel)[0] + ".md"
            md_path = os.path.join(dest_dir, md_rel)

            # Create parent dirs
            os.makedirs(os.path.dirname(md_path), exist_ok=True)

            if os.path.exists(md_path):
                continue

            try:
                content = docx_to_markdown(src_path)
                with open(md_path, "w", encoding="utf-8") as f:
                    f.write(content)
                count += 1
                # Print with repr to avoid terminal encoding issues
                print(f"  OK: {repr(fname)} -> {md_rel}")
            except Exception as e:
                print(f"  ERR: {repr(fname)}: {e}")

    return count


def main():
    total = 0

    # Find the two main Hebrew directories in Working
    ktiva_toranit = None  # כתיבה תורנית
    chomer_torani = None  # חומר תורני

    for entry in os.listdir(WORKING):
        full = os.path.join(WORKING, entry)
        if not os.path.isdir(full):
            continue
        subs = os.listdir(full)
        # כתיבה תורנית has 11 subdirs including להכניס בלב
        if len(subs) >= 10:
            ktiva_toranit = full
            print(f"Found ktiva toranit: {len(subs)} entries")
        # חומר תורני has 2 subdirs (old and new format transcripts)
        elif len(subs) == 2 and any(os.path.isdir(os.path.join(full, s)) for s in subs):
            # Check if subdirs contain .docx files
            for s in subs:
                sp = os.path.join(full, s)
                if os.path.isdir(sp):
                    files = os.listdir(sp)
                    if any(f.endswith('.docx') for f in files):
                        chomer_torani = full
                        print(f"Found chomer torani: {len(subs)} entries")
                        break

    if not ktiva_toranit:
        print("ERROR: Could not find כתיבה תורנית directory")
        return

    # Process each mapped directory
    for eng_name, heb_name in DIR_MAP.items():
        # Search in ktiva_toranit first, then chomer_torani
        src = find_hebrew_dir(ktiva_toranit, heb_name)
        if not src and chomer_torani:
            src = find_hebrew_dir(chomer_torani, heb_name)

        dest = os.path.join(TORAH_WRITING, eng_name)
        print(f"\n=== {eng_name} ===")

        if not src:
            print(f"  Source not found for: {heb_name}")
            continue

        n = convert_tree(src, dest)
        total += n
        print(f"  Converted: {n} files")

    # Also handle the old-format transcripts (skip .doc, only .docx)
    if chomer_torani:
        old_format_dir = None
        for entry in os.listdir(chomer_torani):
            full = os.path.join(chomer_torani, entry)
            if os.path.isdir(full):
                files = os.listdir(full)
                if any(f.endswith('.doc') and not f.endswith('.docx') for f in files):
                    old_format_dir = full
                    print(f"\n=== timlul-old-format (skipped - .doc only) ===")

    print(f"\n{'='*40}")
    print(f"TOTAL: {total} files converted")


if __name__ == "__main__":
    main()
