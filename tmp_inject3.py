import os
import re

files = [
    r"c:\dev\Portfolio-Website\src\pages\en\index.astro",
    r"c:\dev\Portfolio-Website\src\pages\de\index.astro"
]

# We completely replace the whole `<div class="timeline-container"...` block to avoid parsing errors.
# Let's just do it with `multi_replace_file_content` via the Antigravity tools so we get type safety and line number validation!
