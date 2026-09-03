import { formatBRL } from '../format'

const chips = [2000, 4000, 6000, 9000, 12000]

export default function BudgetStep({ valor, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Qual e o seu teto de orcamento?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Use como teto maximo: montamos a melhor configuracao possivel abaixo desse valor.
        </p>
      </div>

      <div className="text-center">
        <span className="text-5xl font-extrabold tracking-tight text-brand-300">
          {formatBRL(valor)}
        </span>
        <span className="ml-2 text-sm text-slate-500">/ maximo</span>
      </div>

      <input
        type="range"
        min={2000}
        max={15000}
        step={100}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Orcamento maximo em reais"
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
