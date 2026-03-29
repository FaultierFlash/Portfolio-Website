import sys
import re

files = [
    r"c:\dev\Portfolio-Website\src\pages\en\index.astro",
    r"c:\dev\Portfolio-Website\src\pages\de\index.astro"
]

mobile_block_en = """
        </div>

        {/* --- MOBILE VERTICAL TIMELINE --- */}
        <div class="block md:hidden w-full px-6 pt-32 pb-48 relative no-scrollbar overflow-y-auto z-10">
            <div class="absolute left-10 top-32 bottom-48 w-[2px] bg-slate-300 dark:bg-slate-700 pointer-events-none"></div>
            {timelineItems.slice().sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((item: any) => {
                const isDuration = !!item.endDate || item.isOngoing;
                const resolvedColor = item.relatedProject?.accentColor || item.color || 'primary';
                const c = colors[resolvedColor] || colors.primary;
                const eventHref = item.relatedProject ? `/${lang}/projects/${item.relatedProject.slug.current}` : undefined;

                return (
                    <div class="relative w-full flex mb-12 group">
                        {/* Timeline node/dot */}
                        <div class="w-16 shrink-0 flex flex-col justify-start items-center relative pt-4 z-10">
                            <div class={`w-4 h-4 rounded-full border-[3px] border-white dark:border-[var(--color-bg)] ${c.bgSolid} shadow-lg ring-2 ring-transparent group-active:ring-[var(--color-project-accent-bg)] transition-all`}></div>
                            <span class={`text-[10px] font-black uppercase tracking-wider mt-3 opacity-60 text-slate-500`}>
                                {new Date(item.startDate).getFullYear()}
                            </span>
                        </div>
                        {/* Content Card */}
                        <div class={`flex-1 bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-2xl p-5 shadow-xl transition-all`}>
                            {eventHref && <a href={eventHref} class="absolute inset-0 z-10 rounded-2xl"></a>}
                            <span class={`text-[10px] font-black uppercase tracking-widest ${c.text} mb-1 block`}>{isDuration ? (item.isOngoing ? 'Present' : new Date(item.endDate).getFullYear()) : 'Event'}</span>
                            <h3 class={`text-lg font-black mb-2 text-[var(--color-text)] leading-tight`}>{item.title}</h3>
                            {item.description && <p class="text-sm border-t border-[var(--color-card-border)] pt-3 mt-3 text-[var(--color-text-dim)] font-medium leading-relaxed">{item.description}</p>}
                            
                            {item.milestoneEvents && item.milestoneEvents.length > 0 && (
                                <div class="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3 relative z-20">
                                    <span class="text-[10px] uppercase font-black text-[var(--color-project-accent)] tracking-widest">Milestones</span>
                                    {item.milestoneEvents.map((evt: any) => {
                                        const subEventHref = evt.relatedProject ? `/${lang}/projects/${evt.relatedProject.slug.current}` : undefined;
                                        return (
                                        <div class="flex flex-col mb-1 relative z-20 pointer-events-auto">
                                            {subEventHref && <a href={subEventHref} class="absolute inset-0"></a>}
                                            <span class="text-[9px] font-black mb-1 opacity-50 text-[var(--color-text)]">{new Date(evt.date).getFullYear()}</span>
                                            <h4 class="text-sm font-bold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-project-accent)] transition-colors">{evt.title}</h4>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
"""

mobile_block_de = mobile_block_en.replace(">Milestones<", ">Meilensteine<").replace(">Present<", ">Heute<").replace(">Event<", ">Ereignis<")

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Hide the horizontal timeline on mobile desktop
    content = content.replace(
        '<div class="timeline-container w-full overflow-x-auto flex items-center relative h-full no-scrollbar cursor-grab active:cursor-grabbing" id="timeline-scroll-area">',
        '<div class="timeline-container hidden md:flex w-full overflow-x-auto items-center relative h-[100vh] no-scrollbar cursor-grab active:cursor-grabbing" id="timeline-scroll-area">'
    )
    
    # 2. Prevent JS scroll hijack on mobile
    content = content.replace(
        "if (timelineSection && timelineContainer) {",
        "if (timelineSection && timelineContainer && window.innerWidth >= 768) {"
    )

    content = content.replace(
        """function updateReveal() {
            if (!timelineTrack || !movingArrow || !actualMarker) return;""",
        """function updateReveal() {
            if (!timelineTrack || !movingArrow || !actualMarker || window.innerWidth < 768) return;"""
    )
    
    # 3. Prevent dragging on mobile via desktop listener
    content = content.replace(
        "timelineContainer.addEventListener('mousedown', (e) => {",
        "timelineContainer.addEventListener('mousedown', (e) => {\n            if(window.innerWidth < 768) return;"
    )

    # 4. Insert the Vertical Timeline
    blockToUse = mobile_block_en if 'en' in file else mobile_block_de
    
    # The end of the horizontal timeline block is right before the Future Infinite Dashed Line.
    # So we'll find this exact snippet:
    target_end_div = r'''
                    </div>
                </div>
            </div>
        </div>

        {/* Future Infinite Dashed Line'''
    
    # Replace the outer div closing tags with the outer divs + the mobile block
    if "{/* Future Infinite Dashed Line" in content:
        split_point = content.find("{/* Future Infinite Dashed Line")
        part1 = content[:split_point]
        part2 = content[split_point:]
        
        # We need to backtrack to the closing div of "timeline-container"
        idx = part1.rfind("</div>")
        
        # We inject right before the `</div>` that closes timelineContainer? No.
        # `<div class="timeline-container...` has its closing div.
        # Right after that div, we insert the new block.
        
        # Actually it's simpler to just do this:
        marker = '</div>\n\n        {/* Future Infinite Dashed Line'
        replacement = blockToUse + '\n\n        {/* Future Infinite Dashed Line'
        content = content.replace(marker, replacement)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Replacement successful")
