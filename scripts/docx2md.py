#!/usr/bin/env python3
"""Convert a single .docx file to markdown. Usage: docx2md.py input.docx output.md"""
import sys
from docx import Document


def convert(docx_path, md_path):
    doc = Document(docx_path)
    lines = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            lines.append("")
            continue

        style = para.style.name if para.style else ""
        if "Heading 1" in style:
            lines.append(f"# {text}")
        elif "Heading 2" in style:
            lines.append(f"## {text}")
        elif "Heading 3" in style:
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

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(result).strip() + "\n")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} input.docx output.md", file=sys.stderr)
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
