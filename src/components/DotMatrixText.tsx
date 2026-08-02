import React from 'react';

const FONT_5X5: Record<string, string[]> = {
  'A': [
    " ### ",
    "#   #",
    "#####",
    "#   #",
    "#   #"
  ],
  'B': [
    "#### ",
    "#   #",
    "#### ",
    "#   #",
    "#### "
  ],
  'C': [
    " ####",
    "#    ",
    "#    ",
    "#    ",
    " ####"
  ],
  'D': [
    "#### ",
    "#   #",
    "#   #",
    "#   #",
    "#### "
  ],
  'E': [
    "#####",
    "#    ",
    "#### ",
    "#    ",
    "#####"
  ],
  'F': [
    "#####",
    "#    ",
    "#### ",
    "#    ",
    "#    "
  ],
  'G': [
    " ####",
    "#    ",
    "#  ##",
    "#   #",
    " ####"
  ],
  'H': [
    "#   #",
    "#   #",
    "#####",
    "#   #",
    "#   #"
  ],
  'I': [
    "#####",
    "  #  ",
    "  #  ",
    "  #  ",
    "#####"
  ],
  'J': [
    "#####",
    "   # ",
    "   # ",
    "#  # ",
    " ##  "
  ],
  'K': [
    "#   #",
    "#  # ",
    "###  ",
    "#  # ",
    "#   #"
  ],
  'L': [
    "#    ",
    "#    ",
    "#    ",
    "#    ",
    "#####"
  ],
  'M': [
    "#   #",
    "## ##",
    "# # #",
    "#   #",
    "#   #"
  ],
  'N': [
    "#   #",
    "##  #",
    "# # #",
    "#  ##",
    "#   #"
  ],
  'O': [
    " ### ",
    "#   #",
    "#   #",
    "#   #",
    " ### "
  ],
  'P': [
    "#### ",
    "#   #",
    "#### ",
    "#    ",
    "#    "
  ],
  'Q': [
    " ### ",
    "#   #",
    "#   #",
    "#  # ",
    " ## #"
  ],
  'R': [
    "#### ",
    "#   #",
    "#### ",
    "#  # ",
    "#   #"
  ],
  'S': [
    " ####",
    "#    ",
    " ### ",
    "    #",
    "#### "
  ],
  'T': [
    "#####",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  "
  ],
  'U': [
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    " ### "
  ],
  'V': [
    "#   #",
    "#   #",
    " # # ",
    " # # ",
    "  #  "
  ],
  'W': [
    "#   #",
    "#   #",
    "# # #",
    "#####",
    "#   #"
  ],
  'X': [
    "#   #",
    " # # ",
    "  #  ",
    " # # ",
    "#   #"
  ],
  'Y': [
    "#   #",
    " # # ",
    "  #  ",
    "  #  ",
    "  #  "
  ],
  'Z': [
    "#####",
    "   # ",
    "  #  ",
    " #   ",
    "#####"
  ],
  '?': [
    " ### ",
    "    #",
    "  ## ",
    "     ",
    "  #  "
  ],
  '!': [
    "  #  ",
    "  #  ",
    "  #  ",
    "     ",
    "  #  "
  ],
  '.': [
    "     ",
    "     ",
    "     ",
    "     ",
    "  #  "
  ],
  ':': [
    "     ",
    "  #  ",
    "     ",
    "  #  ",
    "     "
  ],
  '-': [
    "     ",
    "     ",
    " ### ",
    "     ",
    "     "
  ],
  ' ': [
    "     ",
    "     ",
    "     ",
    "     ",
    "     "
  ]
};

interface DotMatrixTextProps {
  text: string;
  glow?: boolean;
  color?: 'cyan' | 'white';
}

export default function DotMatrixText({ text, glow = true, color = 'cyan' }: DotMatrixTextProps) {
  const upper = text.toUpperCase();
  
  // Split on spaces to allow wrapping by word structure, protecting alignment on small monitors
  const words = upper.split(" ");

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 justify-center items-center select-none animate-pulse" style={{ animationDuration: '6s' }}>
      {words.map((word, wordIdx) => (
        <div key={wordIdx} className="flex gap-1.5 md:gap-2.5">
          {word.split("").map((char, charIdx) => {
            const grid = FONT_5X5[char] || FONT_5X5[' '];
            return (
              <div 
                key={charIdx} 
                className="grid grid-cols-5 gap-[1px] md:gap-[1.5px] w-fit shrink-0"
              >
                {grid.flatMap((row, rIdx) => 
                  row.split("").map((dot, dIdx) => {
                    const isActive = dot === '#';
                    const activeClass = color === 'white'
                      ? (glow ? 'bg-slate-50 shadow-[0_0_8px_rgba(255,255,255,0.95)]' : 'bg-slate-100')
                      : (glow ? 'bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.7)]' : 'bg-cyan-400');
                    const inactiveClass = color === 'white' ? 'bg-white/5' : 'bg-cyan-950/15';

                    return (
                      <div
                        key={`${rIdx}-${dIdx}`}
                        className={`w-[3px] h-[3px] sm:w-[5px] sm:h-[5px] md:w-[6px] md:h-[6px] rounded-[1px] transition-all duration-300 ${
                          isActive ? activeClass : inactiveClass
                        }`}
                      />
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
