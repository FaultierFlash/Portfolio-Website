import sys
import re

files = [
    r"c:\dev\Portfolio-Website\src\pages\en\index.astro",
    r"c:\dev\Portfolio-Website\src\pages\de\index.astro"
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Strip ALL mobile timeline blocks.
    # We want to remove from `{/* --- MOBILE VERTICAL TIMELINE --- */}` down to just before `{/* Future Infinite Dashed Line`
    # Also remove any leftover `</div>` chunks that were part of previous failed injections.
    
    # regex matches `{/* --- MOBILE VERTICAL TIMELINE --- */}` and everything up to `{/* Future Infinite Dashed Line`
    pattern1 = re.compile(r'\{\/\*\s*---\s*MOBILE VERTICAL TIMELINE\s*---\s*\*\/\}.*?(?=\{\/\*\s*Future Infinite Dashed Line)', re.DOTALL)
    
    new_content = pattern1.sub('', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Cleanup script ready")
