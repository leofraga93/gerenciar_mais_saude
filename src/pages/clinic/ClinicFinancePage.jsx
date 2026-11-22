import { useMemo, useState } from 'react'
import { useAppointments } from '../../hooks/useAppointments'
import { APPOINTMENT_STATUS } from '../../data/appointments'
import { CHECK_IN_METHOD } from '../../constants/billingConstants'
import { StatCard } from '../../components/clinic/StatCard'
import { StatusBadge } from '../../components/clinic/StatusBadge'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import {
  IconCheckCircle,
  IconClock,
  IconCreditCard,
} from '../../components/common/Icons'

const MONTH_OPTIONS = [
  { id: 'all', label: 'Todos os meses' },
  { id: '01', label: 'Janeiro', short: 'Jan' },
  { id: '02', label: 'Fevereiro', short: 'Fev' },
  { id: '03', label: 'Março', short: 'Mar' },
  { id: '04', label: 'Abril', short: 'Abr' },
  { id: '05', label: 'Maio', short: 'Mai' },
  { id: '06', label: 'Junho', short: 'Jun' },
  { id: '07', label: 'Julho', short: 'Jul' },
  { id: '08', label: 'Agosto', short: 'Ago' },
  { id: '09', label: 'Setembro', short: 'Set' },
  { id: '10', label: 'Outubro', short: 'Out' },
  { id: '11', label: 'Novembro', short: 'Nov' },
  { id: '12', label: 'Dezembro', short: 'Dez' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function getCheckInLabel(apt) {
  if (apt.checkInMethod === CHECK_IN_METHOD.MANUAL) return 'Check-in manual'
  if (apt.checkInMethod === CHECK_IN_METHOD.MANUAL_REVERSAL) return 'Reversão por token'
  return 'Token presencial'
}

function ClinicFinancePage() {
  const { data: appointments = [], isLoading } = useAppointments()

  const availableYears = useMemo(() => {
    const years = new Set(['2026', '2025'])
    appointments.forEach((apt) => {
      const year = String(apt.selectedDate || apt.date || '').slice(0, 4)
      if (/^\d{4}$/.test(year)) years.add(year)
    })
    return [...years].sort((a, b) => Number(b) - Number(a))
  }, [appointments])

  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [chartMetric, setChartMetric] = useState('count') // 'count' | 'amount'

  // KPIs globais na ordem 3 -> 2 -> 1 (SPEC-09 §4.5)
  const metrics = useMemo(() => {
    const confirmed = appointments.filter(
      (a) => a.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA,
    )
    const realized = appointments.filter((a) => a.status === APPOINTMENT_STATUS.REALIZADO)

    const pendingValidationRevenue = confirmed
      .filter((a) => a.paymentType !== 'CONVENIO')
      .reduce((acc, a) => acc + (a.price || 0), 0)

    const realizedParticular = realized.filter((a) => a.paymentType !== 'CONVENIO')
    const realizedConvenio = realized.filter((a) => a.paymentType === 'CONVENIO')
    const confirmedRevenue = realizedParticular.reduce((acc, a) => acc + (a.price || 0), 0)

    return {
      confirmed,
      realized,
      pendingValidationRevenue,
      confirmedRevenue,
      realizedParticularCount: realizedParticular.length,
      realizedConvenioCount: realizedConvenio.length,
    }
  }, [appointments])

  // Dados filtrados para o gráfico de progressão por pagamento (Ano e Mês)
  const chartData = useMemo(() => {
    const relevantStatuses = new Set([
      APPOINTMENT_STATUS.REALIZADO,
      APPOINTMENT_STATUS.CONFIRMADO_CLINICA,
    ])

    const filtered = appointments.filter((apt) => {
      if (!relevantStatuses.has(apt.status)) return false
      const dateStr = String(apt.selectedDate || apt.date || '')
      if (!dateStr.startsWith(`${selectedYear}-`)) return false
      if (selectedMonth !== 'all' && dateStr.slice(5, 7) !== selectedMonth) return false
      return true
    })

    let buckets = []
    if (selectedMonth === 'all') {
      buckets = MONTH_OPTIONS.slice(1).map((month) => ({
        key: month.id,
        label: month.short,
        realizedCount: 0,
        pendingCount: 0,
        realizedAmount: 0,
        pendingAmount: 0,
      }))

      filtered.forEach((apt) => {
        const monthIdx = Number(String(apt.selectedDate || apt.date).slice(5, 7)) - 1
        if (monthIdx < 0 || monthIdx > 11) return
        const target = buckets[monthIdx]
        const amount = apt.paymentType === 'CONVENIO' ? 0 : Number(apt.price) || 0
        if (apt.status === APPOINTMENT_STATUS.REALIZADO) {
          target.realizedCount += 1
          target.realizedAmount += amount
        } else {
          target.pendingCount += 1
          target.pendingAmount += amount
        }
      })
    } else {
      const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate()
      buckets = [
        { key: '1', label: 'Dias 01–07', min: 1, max: 7 },
        { key: '2', label: 'Dias 08–14', min: 8, max: 14 },
        { key: '3', label: 'Dias 15–21', min: 15, max: 21 },
        { key: '4', label: `Dias 22–${daysInMonth}`, min: 22, max: 31 },
      ].map((b) => ({
        ...b,
        realizedCount: 0,
        pendingCount: 0,
        realizedAmount: 0,
        pendingAmount: 0,
      }))

      filtered.forEach((apt) => {
        const day = Number(String(apt.selectedDate || apt.date).slice(8, 10))
        const target = buckets.find((b) => day >= b.min && day <= b.max)
        if (!target) return
        const amount = apt.paymentType === 'CONVENIO' ? 0 : Number(apt.price) || 0
        if (apt.status === APPOINTMENT_STATUS.REALIZADO) {
          target.realizedCount += 1
          target.realizedAmount += amount
        } else {
          target.pendingCount += 1
          target.pendingAmount += amount
        }
      })
    }

    const particularTotal = filtered.filter((a) => a.paymentType !== 'CONVENIO').length
    const convenioTotal = filtered.filter((a) => a.paymentType === 'CONVENIO').length
    const particularRealizedValue = filtered
      .filter((a) => a.paymentType !== 'CONVENIO' && a.status === APPOINTMENT_STATUS.REALIZADO)
      .reduce((acc, a) => acc + (a.price || 0), 0)

    const maxValue = Math.max(
      1,
      ...buckets.map((b) =>
        chartMetric === 'count'
          ? Math.max(b.realizedCount, b.pendingCount)
          : Math.max(b.realizedAmount, b.pendingAmount),
      ),
    )

    return {
      buckets,
      maxValue,
      totalFiltered: filtered.length,
      particularTotal,
      convenioTotal,
      particularRealizedValue,
    }
  }, [appointments, chartMetric, selectedMonth, selectedYear])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="mt-1 text-sm text-slate-500">
          Receita pendente de validação, receita confirmada pelos atendimentos realizados e progressão por forma de pagamento. Os valores dos exames são recebidos diretamente pela clínica.
        </p>
      </div>

      {/* Ordem 3 -> 2 -> 1 da esquerda para a direita (SPEC-09 §4.5) */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Receita pendente de validação"
            value={<span className="tabular-nums">{formatCurrencyBRL(metrics.pendingValidationRevenue)}</span>}
            sub={`${metrics.confirmed.length} agendamento(s) confirmado(s)`}
            icon={IconClock}
            color="amber"
          />
          <StatCard
            label="Receita confirmada"
            value={<span className="tabular-nums">{formatCurrencyBRL(metrics.confirmedRevenue)}</span>}
            sub={`+ ${metrics.realizedConvenioCount} atendimento(s) via convênio`}
            icon={IconCreditCard}
            color="emerald"
          />
          <StatCard
            label="Exame realizado"
            value={<span className="tabular-nums">{metrics.realized.length}</span>}
            sub={`${metrics.realizedParticularCount} particular(es) · ${metrics.realizedConvenioCount} convênio(s)`}
            icon={IconCheckCircle}
            color="blue"
          />
        </div>
      )}

      {/* Gráfico interativo: Progressão de Agendamento por Pagamento */}
      <section
        aria-labelledby="finance-progression-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="finance-progression-title" className="text-base font-bold text-slate-900">
              Progressão de Agendamento por Pagamento
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Comparativo de exames realizados versus pendentes de validação e distribuição entre particular e convênio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span>Ano</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span>Mês</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="inline-flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label="Métrica do gráfico">
              <button
                type="button"
                onClick={() => setChartMetric('count')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  chartMetric === 'count'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quantidade
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('amount')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  chartMetric === 'amount'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valores (R$)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" aria-hidden="true" />
              Realizados
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" aria-hidden="true" />
              Pendentes de validação
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 tabular-nums">
            <span>
              Particular: <strong className="text-slate-900">{chartData.particularTotal}</strong>
            </span>
            <span>
              Convênio: <strong className="text-slate-900">{chartData.convenioTotal}</strong>
            </span>
            <span>
              Receita realizada no filtro:{' '}
              <strong className="text-emerald-700">
                {formatCurrencyBRL(chartData.particularRealizedValue)}
              </strong>
            </span>
          </div>
        </div>

        {chartData.totalFiltered === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            Nenhum atendimento realizado ou pendente de validação encontrado para {selectedMonth === 'all' ? selectedYear : `${MONTH_OPTIONS.find((m) => m.id === selectedMonth)?.label} de ${selectedYear}`}.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <svg
              viewBox="0 0 720 220"
              className="h-56 w-full min-w-[560px]"
              role="img"
              aria-label="Gráfico de progressão de agendamentos realizados e pendentes"
            >
              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 175 - ratio * 145
                return (
                  <line
                    key={ratio}
                    x1="44"
                    x2="704"
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                )
              })}
              <line x1="44" x2="704" y1="175" y2="175" stroke="#cbd5e1" />

              {chartData.buckets.map((bucket, idx) => {
                const slotWidth = 660 / chartData.buckets.length
                const centerX = 44 + idx * slotWidth + slotWidth / 2
                const barW = Math.min(18, Math.max(8, slotWidth * 0.24))

                const realizedVal =
                  chartMetric === 'count' ? bucket.realizedCount : bucket.realizedAmount
                const pendingVal =
                  chartMetric === 'count' ? bucket.pendingCount : bucket.pendingAmount

                const realizedH =
                  realizedVal > 0 ? Math.max(6, (realizedVal / chartData.maxValue) * 140) : 0
                const pendingH =
                  pendingVal > 0 ? Math.max(6, (pendingVal / chartData.maxValue) * 140) : 0

                const realizedLabel =
                  chartMetric === 'count'
                    ? `${bucket.realizedCount}`
                    : formatCurrencyBRL(bucket.realizedAmount)
                const pendingLabel =
                  chartMetric === 'count'
                    ? `${bucket.pendingCount}`
                    : formatCurrencyBRL(bucket.pendingAmount)

                return (
                  <g key={bucket.key}>
                    <rect
                      x={centerX - barW - 2}
                      y={175 - realizedH}
                      width={barW}
                      height={realizedH}
                      rx="3"
                      fill="#059669"
                    >
                      <title>{`${bucket.label} · Realizados: ${realizedLabel}`}</title>
                    </rect>
                    <rect
                      x={centerX + 2}
                      y={175 - pendingH}
                      width={barW}
                      height={pendingH}
                      rx="3"
                      fill="#f59e0b"
                    >
                      <title>{`${bucket.label} · Pendentes: ${pendingLabel}`}</title>
                    </rect>
                    {realizedVal > 0 && (
                      <text
                        x={centerX - barW / 2 - 2}
                        y={Math.max(16, 170 - realizedH)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#065f46"
                        fontWeight="600"
                      >
                        {chartMetric === 'count' ? bucket.realizedCount : Math.round(bucket.realizedAmount)}
                      </text>
                    )}
                    {pendingVal > 0 && (
                      <text
                        x={centerX + barW / 2 + 2}
                        y={Math.max(16, 170 - pendingH)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#b45309"
                        fontWeight="600"
                      >
                        {chartMetric === 'count' ? bucket.pendingCount : Math.round(bucket.pendingAmount)}
                      </text>
                    )}
                    <text
                      x={centerX}
                      y="196"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#475569"
                    >
                      {bucket.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </section>

      {/* Histórico de atendimentos realizados */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Histórico de Atendimentos Realizados
          </h2>
          {!isLoading && (
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              {metrics.realized.length} registro(s)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : metrics.realized.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-400">
              Nenhum atendimento realizado ainda. Use a Agenda para registrar o check-in e marcar exames como realizados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {metrics.realized.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {apt.patientName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{apt.patientName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {apt.serviceName} · {getCheckInLabel(apt)}
                  </p>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-slate-500">
                    {apt.paymentType === 'CONVENIO' ? `Convênio ${apt.insurance}` : 'Particular'}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">{formatDate(apt.date)}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-emerald-700 tabular-nums">
                    {apt.paymentType === 'CONVENIO'
                      ? 'Convênio'
                      : formatCurrencyBRL(apt.price)}
                  </p>
                  <StatusBadge status={apt.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && metrics.realized.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
            <span className="text-xs font-semibold text-slate-600">
              Total particular realizado
            </span>
            <span className="text-base font-bold text-emerald-700 tabular-nums">
              {formatCurrencyBRL(metrics.confirmedRevenue)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClinicFinancePage
