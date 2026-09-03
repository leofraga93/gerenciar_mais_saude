const API_BASE = ''

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.mensagem || 'Erro ao se comunicar com o servidor.')
  }
  return data
}

export async function getCatalogo() {
  const res = await fetch(`${API_BASE}/api/catalogo`)
  return handle(res)
}

export async function receitasRecomendadas({ orcamento, jogoIds, incluiPerifericos }) {
  const res = await fetch(`${API_BASE}/api/receitas/recomendadas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orcamento, jogoIds, incluiPerifericos }),
  })
  return handle(res)
}

export async function substitutos(produtoId, montagemIds) {
  const res = await fetch(`${API_BASE}/api/montagens/substitutas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produtoId, montagemIds }),
  })
  return handle(res)
}
