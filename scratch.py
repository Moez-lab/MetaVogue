import sys

file_path = r'c:\Users\ahads\Desktop\mueez fyp\web-meta\frontend\src\views\admin\MetaVogueIMView.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace pink/purple/indigo classes with NanoBanana theme classes
replacements = {
    'pink-500/20': '#38506A]/20',
    'border-pink-500': 'border-[#38506A]',
    'text-pink-300': 'text-white',
    'hover:border-pink-500/50': 'hover:border-[#38506A]',
    
    'purple-500/20': '#38506A]/20',
    'border-purple-500': 'border-[#38506A]',
    'text-purple-300': 'text-white',
    'hover:border-purple-500/50': 'hover:border-[#38506A]',
    
    'hover:border-indigo-400/50': 'hover:border-[#38506A]',
    'border-indigo-400': 'border-[#38506A]',
    'text-indigo-400': 'text-[#38506A]',
    'focus:border-indigo-400': 'focus:border-[#38506A]',
    'focus:ring-indigo-400/50': 'focus:ring-[#38506A]/50',

    'text-pink-400': 'text-[#38506A]',
    'focus:border-pink-500': 'focus:border-[#38506A]',
    'focus:ring-pink-500/50': 'focus:ring-[#38506A]/50',
    
    'text-purple-400': 'text-[#38506A]',
    'focus:border-purple-500': 'focus:border-[#38506A]',
    'focus:ring-purple-500/50': 'focus:ring-[#38506A]/50',
    
    'bg-pink-600/10': 'bg-[#38506A]/10',
    'bg-purple-600/10': 'bg-[#28394B]/10',
    
    'selection:bg-pink-500/30': 'selection:bg-[#38506A]/30',
    
    'from-pink-400 via-purple-300 to-indigo-400': 'from-[#38506A] via-slate-200 to-[#38506A]',
    
    'accentColor="pink"': 'accentColor="cyan"',
    'accentColor={outputType === \'outfit\' ? \'pink\' : \'purple\'}': 'accentColor="cyan"',
    
    'accent-pink-500': 'accent-[#38506A]',
    'accent-purple-400': 'accent-slate-400',
    
    'text-indigo-300': 'text-[#38506A]/80',
    
    'from-pink-600 via-purple-600 to-indigo-600': 'from-[#38506A] via-[#28394B] to-[#1C2B38]',
    'shadow-[0_20px_60px_-15px_rgba(219,39,119,0.5)]': 'shadow-[0_25px_80px_-20px_rgba(56,80,106,0.6)]',
    'from-pink-500 via-purple-500 to-indigo-500': 'from-[#38506A] via-slate-400 to-[#38506A]',
    'bg-pink-500': 'bg-[#38506A]'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done replacing colors.")
