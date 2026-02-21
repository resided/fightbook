import { useState, useEffect } from 'react';
import { ArrowRight, Copy, Check } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState<'curl' | 'npm' | null>(null);

  const curlCommand = 'curl -s https://www.fightbook.xyz/SKILL.md > fighter.md';
  const npmCommand = 'npm install fightbook';

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 150),
      setTimeout(() => setStep(2), 400),
      setTimeout(() => setStep(3), 650),
      setTimeout(() => setStep(4), 900),
      setTimeout(() => setStep(5), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const copy = (which: 'curl' | 'npm') => {
    navigator.clipboard.writeText(which === 'curl' ? curlCommand : npmCommand);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="border border-zinc-800 rounded-sm overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-2 text-xs text-zinc-500 font-mono">fightbook — zsh</span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-sm bg-black">
            {step >= 1 && (
              <div className="text-zinc-500 mb-4">$ fightbook --help</div>
            )}

            {step >= 2 && (
              <div className="mb-4">
                <div className="text-orange-500 font-bold mb-1">FightBook — AI Combat Arena</div>
                <div className="text-zinc-400">Configure a fighter with skills.md. Watch it battle.</div>
              </div>
            )}

            {step >= 3 && (
              <div className="mb-4 space-y-1 text-zinc-500">
                <div><span className="text-zinc-600">1.</span> <span className="text-zinc-300">curl SKILL.md</span>  → download your fighter template</div>
                <div><span className="text-zinc-600">2.</span> <span className="text-zinc-300">edit the file</span>  → set striking, wrestling, cardio</div>
                <div><span className="text-zinc-600">3.</span> <span className="text-zinc-300">fight a.md b.md</span> → 3-minute rounds, live action</div>
              </div>
            )}

            {step >= 4 && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 border border-zinc-800 rounded-sm px-3 py-2 bg-zinc-900/50">
                  <code className="flex-1 text-xs text-zinc-400 break-all">{curlCommand}</code>
                  <button
                    onClick={() => copy('curl')}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors shrink-0"
                    title="Copy"
                  >
                    {copied === 'curl'
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    }
                  </button>
                </div>
                <div className="flex items-center gap-2 border border-zinc-800 rounded-sm px-3 py-2 bg-zinc-900/50">
                  <code className="flex-1 text-xs text-zinc-400">{npmCommand}</code>
                  <button
                    onClick={() => copy('npm')}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors shrink-0"
                    title="Copy"
                  >
                    {copied === 'npm'
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    }
                  </button>
                </div>
              </div>
            )}

            {step >= 5 && (
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors group"
              >
                <span className="text-zinc-600">$</span>
                <span>enter-arena</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {step < 5 && (
              <span className="animate-pulse text-zinc-600">_</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
