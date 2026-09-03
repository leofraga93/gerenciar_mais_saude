import { formatBRL } from '../format'

const chips = [1500, 3000, 5000, 8000, 12000]

export default function StepOrcamento({ valor, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Qual e o seu orcamento?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Arraste o controle ou toque em um valor sugerido. Nao se preocupe: montamos a melhor
          configuracao dentro do valor.
        </p>
      </div>

      <div className="text-center">
        <span className="text-5xl font-extrabold tracking-tight text-brand-300">
          {formatBRL(valor)}
        </span>
      </div>

      <input
        type="range"
        min={1500}
        max={15000}
        step={100}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Orcamento em reais"
      />

      <div className="flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              valor === c
                ? 'border-brand-500 bg-brand-600 text-white'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-brand-500 hover:text-white'
            }`}
          >
            {formatBRL(c)}
          </button>
        ))}
      </div>
    </div>
  )
}
