import { Link } from 'react-router-dom'
import brandLogo from '../assets/logo-500-sem-fundo.png'

/** Destino mock para ROLE_CLINICA (portal administrativo). Substituir por dados reais com API. */
function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Gerenciar Mais Saúde" className="h-12 w-12 object-contain" />
            <div>
              <p className="font-semibold text-slate-900">Portal da clínica</p>
              <p className="text-sm text-slate-500">Área logada (mock)</p>
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
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Este é o destino após o acesso como clínica. Quando a API estiver disponível, o perfil
          virá do token (<code className="rounded bg-slate-200 px-1 text-sm">ROLE_CLINICA</code>) e
          esta área exibirá agenda, recebimentos e métricas reais.
        </p>
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Conteúdo do dashboard em construção
        </div>
      </div>
    </main>
  )
}

export default DashboardPage
