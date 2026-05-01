import { Link, useLocation } from 'react-router-dom'
import brandLogo from '../assets/logo-500-sem-fundo.png'

/** Destino mock para ROLE_USUARIO: boas-vindas, lojas e perfil básico; agendamento apenas no app. */
function PatientWelcomePage() {
  const location = useLocation()
  const email = location.state?.email ?? ''

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Gerenciar Mais Saúde" className="h-12 w-12 object-contain" />
            <div>
              <p className="font-semibold text-slate-900">Gerenciar Mais Saúde</p>
              <p className="text-sm text-slate-500">Paciente</p>
            </div>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Sair para a página inicial
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
        <h1 className="text-3xl font-bold text-slate-900">Boas-vindas</h1>
        <p className="mt-3 text-slate-600">
          Obrigado por acessar. Continue sua jornada pelo aplicativo para agendar consultas e usar
          todos os recursos.
        </p>

        <div className="mt-8 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Seu perfil (visualização básica)</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
                <dt className="text-slate-500">E-mail</dt>
                <dd className="font-medium text-slate-800">{email || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-slate-500">Nome</dt>
                <dd className="text-slate-400">Disponível após integração com API</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-amber-900">Agendamento</h2>
            <p className="mt-2 text-sm text-amber-800">
              O agendamento completo fica disponível apenas no aplicativo. Na web você pode apenas
              conferir dados básicos do perfil.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Baixe o app</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-emerald-600 bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                App Store
              </a>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-emerald-600 bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Google Play
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default PatientWelcomePage
