import { ArrowRight, Building2, UserRound } from 'lucide-react'

function NeutralHeroSelector({ onSelectNiche }) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] w-full items-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2200&q=85"
        alt="Profissional de saúde acolhendo uma pessoa durante um atendimento"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-slate-900/20" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24">
        <div className="space-y-6 md:col-span-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
            Gerenciar Mais Saúde
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Cuidar começa com uma boa conexão.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
            Aproximamos pessoas e serviços de saúde para tornar cada escolha mais clara e cada atendimento mais organizado.
          </p>
          <p className="text-sm font-medium text-white/80">
            Como você gostaria de conhecer a plataforma?
          </p>
        </div>

        <div className="grid gap-4 md:col-span-5">
          <button
          type="button"
          onClick={() => onSelectNiche('PATIENT')}
          className="group flex min-h-36 items-center gap-5 rounded-2xl border border-white/70 bg-white/95 p-6 text-left shadow-xl shadow-slate-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRound className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-semibold text-slate-900">Sou Paciente</span>
            <span className="mt-1 block text-sm leading-relaxed text-slate-600">
              Conheça exames, convênios e opções de atendimento.
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-emerald-700 transition group-hover:translate-x-1" aria-hidden="true" />
          </button>

          <button
          type="button"
          onClick={() => onSelectNiche('CLINIC')}
          className="group flex min-h-36 items-center gap-5 rounded-2xl border border-white/70 bg-white/95 p-6 text-left shadow-xl shadow-slate-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Building2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-semibold text-slate-900">Sou Clínica</span>
            <span className="mt-1 block text-sm leading-relaxed text-slate-600">
              Organize sua operação e amplie sua conexão com pacientes.
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-blue-700 transition group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default NeutralHeroSelector
