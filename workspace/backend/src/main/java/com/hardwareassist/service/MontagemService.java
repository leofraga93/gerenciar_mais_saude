package com.hardwareassist.service;

import com.hardwareassist.domain.ArquiteturaPlataforma;
import com.hardwareassist.domain.Jogo;
import com.hardwareassist.domain.Produto;
import com.hardwareassist.domain.ReceitaBase;
import com.hardwareassist.domain.TipoComponente;
import com.hardwareassist.domain.TipoRam;
import com.hardwareassist.dto.ProdutoDTO;
import com.hardwareassist.dto.RecomendacaoRequest;
import com.hardwareassist.dto.RecomendacaoResponse;
import com.hardwareassist.repository.JogoRepository;
import com.hardwareassist.repository.ProdutoRepository;
import com.hardwareassist.repository.ReceitaBaseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MontagemService {

    private final ProdutoRepository produtoRepository;
    private final JogoRepository jogoRepository;
    private final ReceitaBaseRepository receitaBaseRepository;

    public MontagemService(ProdutoRepository produtoRepository,
                           JogoRepository jogoRepository,
                           ReceitaBaseRepository receitaBaseRepository) {
        this.produtoRepository = produtoRepository;
        this.jogoRepository = jogoRepository;
        this.receitaBaseRepository = receitaBaseRepository;
    }

    public RecomendacaoResponse recomendar(RecomendacaoRequest req) {
        Montagem melhor = melhorPorMarcas(req, List.of("AMD", "INTEL"));
        if (melhor == null) {
            throw new RecomendacaoImpossivelException(
                    "Nao foi possivel montar uma configuracao com esse orcamento.");
        }
        return paraResposta(melhor);
    }

    public List<RecomendacaoResponse> recomendarPorMarca(RecomendacaoRequest req) {
        List<RecomendacaoResponse> resultado = new ArrayList<>();
        for (String marca : List.of("AMD", "INTEL")) {
            Montagem m = melhorPorMarcas(req, List.of(marca));
            if (m != null) {
                resultado.add(paraResposta(m));
            }
        }
        if (resultado.isEmpty()) {
            throw new RecomendacaoImpossivelException(
                    "Nao foi possivel montar uma configuracao com esse orcamento.");
        }
        return resultado;
    }

    public List<ProdutoDTO> substitutos(Long produtoId, List<Long> montagemIds) {
        Produto alvo = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RecomendacaoImpossivelException("Produto nao encontrado."));

        List<Produto> build = montagemIds == null || montagemIds.isEmpty()
                ? List.of()
                : produtoRepository.findAllById(montagemIds);

        return poolAlternativas(alvo, build).stream()
                .filter(p -> !p.getId().equals(produtoId))
                .filter(p -> p.getPreco().compareTo(alvo.getPreco()) < 0)
                .sorted(Comparator.comparing(Produto::getPreco).reversed())
                .map(ProdutoDTO::from)
                .toList();
    }

    private Montagem melhorPorMarcas(RecomendacaoRequest req, List<String> marcas) {
        int[] pesos = calcularPesos(req);
        BigDecimal orcamento = req.orcamento();
        boolean perif = req.comPerifericos();

        Montagem melhor = null;
        for (String marca : marcas) {
            for (ArquiteturaPlataforma plataforma : plataformasCandidatas(marca)) {
                Montagem m = montar(plataforma, orcamento, pesos[0], pesos[1], pesos[2], perif);
                if (m == null) {
                    continue;
                }
                if (melhor == null || ehMelhor(m, melhor, orcamento)) {
                    melhor = m;
                }
            }
        }
        if (melhor == null) {
            return null;
        }
        ajustarOrcamento(melhor, orcamento);
        tentarUpgrade(melhor, orcamento);
        corrigirFonte(melhor, orcamento);
        preencherObservacoes(melhor, orcamento);
        return melhor;
    }

    private int[] calcularPesos(RecomendacaoRequest req) {
        int wCpu = 1;
        int wGpu = 1;
        int wRam = 1;
        if (req.jogoIds() != null && !req.jogoIds().isEmpty()) {
            for (Jogo j : jogoRepository.findAllById(req.jogoIds())) {
                wCpu = Math.max(wCpu, j.getPesoCpu());
                wGpu = Math.max(wGpu, j.getPesoGpu());
                wRam = Math.max(wRam, j.getPesoRam());
            }
        }
        return new int[]{wCpu, wGpu, wRam};
    }

    private boolean ehMelhor(Montagem a, Montagem b, BigDecimal orcamento) {
        boolean aDentro = a.total.compareTo(orcamento) <= 0;
        boolean bDentro = b.total.compareTo(orcamento) <= 0;
        if (aDentro != bDentro) {
            return aDentro;
        }
        if (aDentro) {
            return a.pesoGeral > b.pesoGeral;
        }
        return a.total.compareTo(b.total) < 0;
    }

    private List<ArquiteturaPlataforma> plataformasCandidatas(String marca) {
        if (marca == null || marca.isBlank()
                || marca.equalsIgnoreCase("TODAS") || marca.equalsIgnoreCase("QUALQUER")) {
            return List.of(ArquiteturaPlataforma.values());
        }
        return switch (marca.toUpperCase()) {
            case "AMD" -> List.of(ArquiteturaPlataforma.AMD_AM5, ArquiteturaPlataforma.AMD_AM4);
            case "INTEL" -> List.of(ArquiteturaPlataforma.INTEL_LGA1851, ArquiteturaPlataforma.INTEL_LGA1700);
            default -> List.of(ArquiteturaPlataforma.values());
        };
    }

    private Montagem montar(ArquiteturaPlataforma plataforma, BigDecimal orcamento,
                            int wCpu, int wGpu, int wRam, boolean incluiPerifericos) {
        BigDecimal pctPlaca = bd(incluiPerifericos ? 0.11 : 0.12);
        BigDecimal pctFonte = bd(incluiPerifericos ? 0.08 : 0.09);
        BigDecimal pctGabinete = bd(0.04);
        BigDecimal pctArmazenamento = bd(incluiPerifericos ? 0.07 : 0.08);
        BigDecimal pctMonitor = bd(incluiPerifericos ? 0.08 : 0);
        BigDecimal pctAcessorios = bd(incluiPerifericos ? 0.03 : 0);
        BigDecimal resto = bd(1).subtract(pctPlaca).subtract(pctFonte)
                .subtract(pctGabinete).subtract(pctArmazenamento)
                .subtract(pctMonitor).subtract(pctAcessorios);

        double rawCpu = 25.0 * wCpu;
        double rawGpu = 30.0 * wGpu;
        double rawRam = 12.0 * wRam;
        double totalRaw = rawCpu + rawGpu + rawRam;

        BigDecimal pctCpu = resto.multiply(bd(rawCpu / totalRaw));
        BigDecimal pctGpu = resto.multiply(bd(rawGpu / totalRaw));
        BigDecimal pctRam = resto.multiply(bd(rawRam / totalRaw));

        List<Produto> placas = produtoRepository.findByCategoriaAndPlataforma(
                TipoComponente.PLACA_MAE, plataforma);
        Produto placa = escolher(placas, orcamento.multiply(pctPlaca));
        if (placa == null) {
            return null;
        }
        TipoRam tipoRam = placa.getTipoMemoria();

        List<Produto> cpus = produtoRepository.findByCategoriaAndPlataforma(
                TipoComponente.CPU, plataforma);
        Produto cpu = escolher(cpus, orcamento.multiply(pctCpu));
        if (cpu == null) {
            return null;
        }

        List<Produto> gpus = produtoRepository.findByCategoria(TipoComponente.GPU);
        Produto gpu = escolher(gpus, orcamento.multiply(pctGpu));
        if (gpu == null) {
            return null;
        }

        int slotsDisponiveis = placa.getSlotsRamFornecidos() != null
                ? placa.getSlotsRamFornecidos() : 0;
        List<Produto> rams = produtoRepository.findByCategoriaAndTipoMemoria(
                TipoComponente.RAM, tipoRam);
        Produto ram = escolherRam(rams, orcamento.multiply(pctRam), slotsDisponiveis);
        if (ram == null) {
            return null;
        }

        int consumo = consumoTotal(cpu, gpu, ram, placa, null, null);
        List<Produto> fontes = produtoRepository.findByCategoria(TipoComponente.FONTE);
        Produto fonte = escolherFonte(fontes, consumo, orcamento.multiply(pctFonte));
        if (fonte == null) {
            return null;
        }

        List<Produto> gabinetes = produtoRepository.findByCategoria(TipoComponente.GABINETE);
        Produto gabinete = escolher(gabinetes, orcamento.multiply(pctGabinete));
        List<Produto> armazenamentos = produtoRepository.findByCategoria(TipoComponente.ARMAZENAMENTO);
        Produto armazenamento = escolher(armazenamentos, orcamento.multiply(pctArmazenamento));

        Produto monitor = null;
        Produto acessorios = null;
        if (incluiPerifericos) {
            List<Produto> perifericos = produtoRepository.findByCategoria(TipoComponente.PERIFERICO);
            monitor = escolher(perifericos.stream()
                    .filter(p -> p.getNome().startsWith("Monitor")).toList(),
                    orcamento.multiply(pctMonitor));
            acessorios = escolher(perifericos.stream()
                    .filter(p -> !p.getNome().startsWith("Monitor")).toList(),
                    orcamento.multiply(pctAcessorios));
        }

        Montagem m = new Montagem();
        m.plataforma = plataforma.name();
        m.addItem(cpu);
        m.addItem(gpu);
        m.addItem(ram);
        m.addItem(placa);
        m.addItem(fonte);
        m.addItem(gabinete);
        m.addItem(armazenamento);
        m.addItem(monitor);
        m.addItem(acessorios);
        return m;
    }

    private Produto escolher(List<Produto> candidatos, BigDecimal orcamentoCategoria) {
        if (candidatos == null || candidatos.isEmpty()) {
            return null;
        }
        Comparator<Produto> porDesempenho = Comparator
                .comparingInt(Produto::getPesoDesempenho).reversed()
                .thenComparing(Produto::getPreco);
        return candidatos.stream()
                .filter(c -> c.getPreco().compareTo(orcamentoCategoria) <= 0)
                .min(porDesempenho)
                .orElseGet(() -> candidatos.stream()
                        .min(Comparator.comparing(Produto::getPreco)).get());
    }

    private Produto escolherRam(List<Produto> rams, BigDecimal orcamento, int slotsDisponiveis) {
        List<Produto> compativeis = rams.stream()
                .filter(r -> slotsDisponiveis <= 0
                        || r.getSlotsRamRequeridos() == null
                        || r.getSlotsRamRequeridos() <= slotsDisponiveis)
                .toList();
        if (compativeis.isEmpty()) {
            return null;
        }
        Comparator<Produto> porDesempenho = Comparator
                .comparingInt(Produto::getPesoDesempenho).reversed()
                .thenComparing(Produto::getPreco);
        Produto dentro = compativeis.stream()
                .filter(r -> r.getPreco().compareTo(orcamento) <= 0)
                .min(porDesempenho)
                .orElse(null);
        if (dentro != null) {
            return dentro;
        }
        return compativeis.stream().min(Comparator.comparing(Produto::getPreco)).get();
    }

    private Produto escolherFonte(List<Produto> fontes, int consumo, BigDecimal orcamento) {
        if (fontes == null || fontes.isEmpty()) {
            return null;
        }
        return fontes.stream()
                .filter(f -> f.getPotenciaWattsFornecida() >= consumo)
                .filter(f -> f.getPreco().compareTo(orcamento) <= 0)
                .min(Comparator.comparingInt(Produto::getPotenciaWattsFornecida))
                .orElseGet(() -> fontes.stream()
                        .filter(f -> f.getPotenciaWattsFornecida() >= consumo)
                        .min(Comparator.comparingInt(Produto::getPotenciaWattsFornecida))
                        .orElseGet(() -> fontes.stream()
                                .max(Comparator.comparingInt(Produto::getPotenciaWattsFornecida)).get()));
    }

    private void ajustarOrcamento(Montagem m, BigDecimal orcamento) {
        for (int tentativa = 0; tentativa < 5 && m.total.compareTo(orcamento) > 0; tentativa++) {
            boolean trocou = false;
            List<Produto> ordenados = m.itens.stream()
                    .sorted(Comparator.comparing(Produto::getPreco).reversed())
                    .toList();
            for (Produto atual : ordenados) {
                if (atual.getCategoria() == TipoComponente.PLACA_MAE) {
                    continue;
                }
                List<Produto> pool = poolPara(atual, m);
                Produto substituto = pool.stream()
                        .filter(p -> !p.getId().equals(atual.getId()))
                        .filter(p -> p.getPreco().compareTo(atual.getPreco()) < 0)
                        .max(Comparator.comparing(Produto::getPreco))
                        .orElse(null);
                if (substituto == null) {
                    continue;
                }
                BigDecimal novoTotal = m.total.subtract(atual.getPreco()).add(substituto.getPreco());
                if (novoTotal.compareTo(orcamento) <= 0) {
                    m.trocar(atual, substituto, novoTotal);
                    trocou = true;
                    break;
                }
            }
            if (!trocou) {
                break;
            }
        }
    }

    private void tentarUpgrade(Montagem m, BigDecimal orcamento) {
        for (int tentativa = 0; tentativa < 8 && m.total.compareTo(orcamento) < 0; tentativa++) {
            MelhorUpgrade melhor = null;
            for (Produto atual : m.itens) {
                if (atual.getCategoria() == TipoComponente.PLACA_MAE) {
                    continue;
                }
                for (Produto cand : poolPara(atual, m)) {
                    if (cand.getId().equals(atual.getId())
                            || cand.getPesoDesempenho() <= atual.getPesoDesempenho()) {
                        continue;
                    }
                    BigDecimal novoTotal = m.total.subtract(atual.getPreco()).add(cand.getPreco());
                    if (novoTotal.compareTo(orcamento) > 0) {
                        continue;
                    }
                    if (atual.getCategoria() != TipoComponente.FONTE && blocoPSU(atual, cand, m)) {
                        continue;
                    }
                    int deltaPeso = cand.getPesoDesempenho() - atual.getPesoDesempenho();
                    BigDecimal custo = cand.getPreco().subtract(atual.getPreco());
                    if (melhor == null || deltaPeso > melhor.deltaPeso
                            || (deltaPeso == melhor.deltaPeso && custo.compareTo(melhor.custo) < 0)) {
                        melhor = new MelhorUpgrade(atual, cand, novoTotal, deltaPeso, custo);
                    }
                }
            }
            if (melhor == null) {
                break;
            }
            m.trocar(melhor.atual, melhor.candidato, melhor.novoTotal);
        }
    }

    private boolean blocoPSU(Produto atual, Produto cand, Montagem m) {
        int delta = (cand.getConsumoWatts() != null ? cand.getConsumoWatts() : 0)
                - (atual.getConsumoWatts() != null ? atual.getConsumoWatts() : 0);
        if (delta <= 0) {
            return false;
        }
        Produto fonte = m.itemPorCategoria(TipoComponente.FONTE);
        return fonte == null || m.consumoTotal + delta > fonte.getPotenciaWattsFornecida();
    }

    private void corrigirFonte(Montagem m, BigDecimal orcamento) {
        Produto fonte = m.itemPorCategoria(TipoComponente.FONTE);
        if (fonte == null || m.consumoTotal <= fonte.getPotenciaWattsFornecida()) {
            return;
        }
        List<Produto> fontes = produtoRepository.findByCategoria(TipoComponente.FONTE);
        Produto adequada = fontes.stream()
                .filter(f -> f.getPotenciaWattsFornecida() >= m.consumoTotal)
                .min(Comparator.comparing(Produto::getPreco))
                .orElse(null);
        if (adequada == null) {
            return;
        }
        BigDecimal novoTotal = m.total.subtract(fonte.getPreco()).add(adequada.getPreco());
        if (novoTotal.compareTo(orcamento) <= 0) {
            m.trocar(fonte, adequada, novoTotal);
        }
    }

    private void preencherObservacoes(Montagem m, BigDecimal orcamento) {
        m.observacoes.clear();
        m.observacoes.add("Plataforma " + m.plataforma.replace('_', ' ')
                + " escolhida para melhor custo-beneficio.");

        if (m.total.compareTo(orcamento) > 0) {
            m.observacoes.add("A montagem ficou R$ "
                    + m.total.subtract(orcamento).setScale(2) + " acima do orcamento informado.");
        }

        Produto fonte = m.itemPorCategoria(TipoComponente.FONTE);
        if (fonte != null) {
            int folga = fonte.getPotenciaWattsFornecida() - m.consumoTotal;
            if (folga < 100) {
                m.observacoes.add("Fonte com folga apertada (" + folga + "W). Considere um "
                        + "modelo maior para upgrade futuro.");
            }
        }
    }

    private List<Produto> poolPara(Produto atual, Montagem m) {
        return switch (atual.getCategoria()) {
            case CPU -> produtoRepository.findByCategoriaAndPlataforma(
                    TipoComponente.CPU, ArquiteturaPlataforma.valueOf(m.plataforma));
            case PLACA_MAE -> produtoRepository.findByCategoriaAndPlataforma(
                    TipoComponente.PLACA_MAE, ArquiteturaPlataforma.valueOf(m.plataforma));
            case RAM -> produtoRepository.findByCategoriaAndTipoMemoria(
                    TipoComponente.RAM, atual.getTipoMemoria());
            case PERIFERICO -> {
                boolean monitor = atual.getNome().startsWith("Monitor");
                yield produtoRepository.findByCategoria(TipoComponente.PERIFERICO).stream()
                        .filter(p -> p.getNome().startsWith("Monitor") == monitor)
                        .toList();
            }
            default -> produtoRepository.findByCategoria(atual.getCategoria());
        };
    }

    private List<Produto> poolAlternativas(Produto alvo, List<Produto> build) {
        return switch (alvo.getCategoria()) {
            case CPU -> {
                Produto placa = itemPorCategoria(build, TipoComponente.PLACA_MAE);
                yield placa != null && placa.getPlataforma() != null
                        ? produtoRepository.findByCategoriaAndPlataforma(
                                TipoComponente.CPU, placa.getPlataforma())
                        : produtoRepository.findByCategoria(TipoComponente.CPU);
            }
            case PLACA_MAE -> {
                Produto ram = itemPorCategoria(build, TipoComponente.RAM);
                List<Produto> placas = produtoRepository.findByCategoriaAndPlataforma(
                        TipoComponente.PLACA_MAE, alvo.getPlataforma());
                if (ram != null && ram.getTipoMemoria() != null) {
                    placas = placas.stream()
                            .filter(p -> p.getTipoMemoria() == ram.getTipoMemoria())
                            .toList();
                }
                yield placas;
            }
            case RAM -> {
                Produto placa = itemPorCategoria(build, TipoComponente.PLACA_MAE);
                int slots = placa != null && placa.getSlotsRamFornecidos() != null
                        ? placa.getSlotsRamFornecidos() : 0;
                yield produtoRepository.findByCategoriaAndTipoMemoria(
                                TipoComponente.RAM, alvo.getTipoMemoria()).stream()
                        .filter(r -> slots <= 0 || r.getSlotsRamRequeridos() <= slots)
                        .toList();
            }
            case FONTE -> {
                int consumo = consumoDaBuild(build);
                yield produtoRepository.findByCategoria(TipoComponente.FONTE).stream()
                        .filter(f -> f.getPotenciaWattsFornecida() >= consumo)
                        .toList();
            }
            default -> produtoRepository.findByCategoria(alvo.getCategoria());
        };
    }

    private int consumoDaBuild(List<Produto> build) {
        int consumo = 0;
        for (Produto p : build) {
            if (p != null && p.getConsumoWatts() != null) {
                consumo += p.getConsumoWatts();
            }
        }
        Produto ram = itemPorCategoria(build, TipoComponente.RAM);
        if (ram != null && ram.getSlotsRamRequeridos() != null) {
            consumo += ram.getSlotsRamRequeridos() * 10;
        }
        return consumo + 60;
    }

    private Produto itemPorCategoria(List<Produto> build, TipoComponente categoria) {
        return build.stream()
                .filter(i -> i.getCategoria() == categoria)
                .findFirst()
                .orElse(null);
    }

    private int consumoTotal(Produto cpu, Produto gpu, Produto ram,
                             Produto placa, Produto fonte, Produto armazenamento) {
        int consumo = 0;
        for (Produto p : java.util.Arrays.asList(cpu, gpu, placa, fonte, armazenamento)) {
            if (p != null && p.getConsumoWatts() != null) {
                consumo += p.getConsumoWatts();
            }
        }
        if (ram != null && ram.getSlotsRamRequeridos() != null) {
            consumo += ram.getSlotsRamRequeridos() * 10;
        }
        return consumo + 60;
    }

    private RecomendacaoResponse paraResposta(Montagem m) {
        String marca = m.plataforma.startsWith("AMD") ? "AMD" : "INTEL";
        String receitaNome = null;
        List<ReceitaBase> receitas = receitaBaseRepository.findByArquiteturaMarca(marca);
        if (!receitas.isEmpty()) {
            ReceitaBase maisProxima = receitas.stream()
                    .min(Comparator.comparingInt(
                            r -> Math.abs(r.getPesoGeralCalculado() - m.pesoGeral)))
                    .orElse(null);
            if (maisProxima != null) {
                receitaNome = maisProxima.getNome();
            }
        }

        List<RecomendacaoResponse.ItemMontagem> itens = m.itens.stream()
                .sorted(Comparator.comparing(p -> p.getCategoria().ordinal()))
                .map(p -> new RecomendacaoResponse.ItemMontagem(
                        p.getId(),
                        p.getNome(),
                        p.getCategoria().name(),
                        p.getPreco(),
                        p.getLinkAfiliado(),
                        p.getPlataforma() != null ? p.getPlataforma().name() : null,
                        p.getTipoMemoria() != null ? p.getTipoMemoria().name() : null,
                        rotuloCategoria(p.getCategoria())))
                .toList();

        return new RecomendacaoResponse(
                m.plataforma,
                receitaNome,
                itens,
                m.total,
                m.pesoGeral,
                List.copyOf(m.observacoes));
    }

    private String rotuloCategoria(TipoComponente categoria) {
        return switch (categoria) {
            case CPU -> "Processador";
            case GPU -> "Placa de video";
            case RAM -> "Memoria RAM";
            case PLACA_MAE -> "Placa-mae";
            case FONTE -> "Fonte de alimentacao";
            case GABINETE -> "Gabinete";
            case ARMAZENAMENTO -> "Armazenamento";
            case PERIFERICO -> "Periferico";
        };
    }

    private BigDecimal bd(double valor) {
        return BigDecimal.valueOf(valor);
    }

    private static class MelhorUpgrade {
        private final Produto atual;
        private final Produto candidato;
        private final BigDecimal novoTotal;
        private final int deltaPeso;
        private final BigDecimal custo;

        private MelhorUpgrade(Produto atual, Produto candidato, BigDecimal novoTotal,
                              int deltaPeso, BigDecimal custo) {
            this.atual = atual;
            this.candidato = candidato;
            this.novoTotal = novoTotal;
            this.deltaPeso = deltaPeso;
            this.custo = custo;
        }
    }

    private static class Montagem {
        private final List<Produto> itens = new ArrayList<>();
        private final List<String> observacoes = new ArrayList<>();
        private BigDecimal total = BigDecimal.ZERO;
        private int pesoGeral = 0;
        private int consumoTotal = 0;
        private String plataforma;

        private void addItem(Produto p) {
            if (p == null) {
                return;
            }
            itens.add(p);
            total = total.add(p.getPreco());
            pesoGeral += p.getPesoDesempenho();
            recalcularConsumo();
        }

        private void trocar(Produto antigo, Produto novo, BigDecimal novoTotal) {
            itens.removeIf(i -> i.getId().equals(antigo.getId()));
            itens.add(novo);
            pesoGeral = pesoGeral - antigo.getPesoDesempenho() + novo.getPesoDesempenho();
            total = novoTotal;
            recalcularConsumo();
        }

        private void recalcularConsumo() {
            int consumo = 0;
            for (Produto p : itens) {
                if (p.getConsumoWatts() != null) {
                    consumo += p.getConsumoWatts();
                }
            }
            Produto ram = itemPorCategoria(TipoComponente.RAM);
            if (ram != null && ram.getSlotsRamRequeridos() != null) {
                consumo += ram.getSlotsRamRequeridos() * 10;
            }
            consumoTotal = consumo + 60;
        }

        private Produto itemPorCategoria(TipoComponente categoria) {
            return itens.stream()
                    .filter(i -> i.getCategoria() == categoria)
                    .findFirst()
                    .orElse(null);
        }
    }
}
