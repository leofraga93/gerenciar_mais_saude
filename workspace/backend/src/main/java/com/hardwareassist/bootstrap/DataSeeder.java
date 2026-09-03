package com.hardwareassist.bootstrap;

import com.hardwareassist.domain.ArquiteturaPlataforma;
import com.hardwareassist.domain.Jogo;
import com.hardwareassist.domain.Produto;
import com.hardwareassist.domain.ReceitaBase;
import com.hardwareassist.domain.TipoComponente;
import com.hardwareassist.domain.TipoRam;
import com.hardwareassist.repository.JogoRepository;
import com.hardwareassist.repository.ProdutoRepository;
import com.hardwareassist.repository.ReceitaBaseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProdutoRepository produtoRepository;
    private final JogoRepository jogoRepository;
    private final ReceitaBaseRepository receitaBaseRepository;

    public DataSeeder(ProdutoRepository produtoRepository,
                      JogoRepository jogoRepository,
                      ReceitaBaseRepository receitaBaseRepository) {
        this.produtoRepository = produtoRepository;
        this.jogoRepository = jogoRepository;
        this.receitaBaseRepository = receitaBaseRepository;
    }

    @Override
    public void run(String... args) {
        if (produtoRepository.count() > 0) {
            return;
        }

        List<Produto> produtos = seedProdutos();
        produtoRepository.saveAll(produtos);

        List<Jogo> jogos = seedJogos();
        jogoRepository.saveAll(jogos);

        seedReceitas(produtos);
    }

    private List<Produto> seedProdutos() {
        List<Produto> lista = new ArrayList<>();

        // CPU - AMD AM4
        lista.add(produto("AMD Ryzen 5 5600 (6 nucleos, AM4)", TipoComponente.CPU, 850,
                ArquiteturaPlataforma.AMD_AM4, null, 0, 0, 65, 0, 3));
        lista.add(produto("AMD Ryzen 7 5700X (8 nucleos, AM4)", TipoComponente.CPU, 1350,
                ArquiteturaPlataforma.AMD_AM4, null, 0, 0, 65, 0, 3));
        lista.add(produto("AMD Ryzen 9 5900X (12 nucleos, AM4)", TipoComponente.CPU, 2200,
                ArquiteturaPlataforma.AMD_AM4, null, 0, 0, 105, 0, 4));

        // CPU - AMD AM5
        lista.add(produto("AMD Ryzen 5 7600 (6 nucleos, AM5)", TipoComponente.CPU, 1500,
                ArquiteturaPlataforma.AMD_AM5, null, 0, 0, 65, 0, 3));
        lista.add(produto("AMD Ryzen 7 7700X (8 nucleos, AM5)", TipoComponente.CPU, 2300,
                ArquiteturaPlataforma.AMD_AM5, null, 0, 0, 105, 0, 3));
        lista.add(produto("AMD Ryzen 7 7800X3D (gamer, AM5)", TipoComponente.CPU, 3200,
                ArquiteturaPlataforma.AMD_AM5, null, 0, 0, 120, 0, 4));

        // CPU - Intel LGA1700
        lista.add(produto("Intel Core i5-12400F (6 nucleos, LGA1700)", TipoComponente.CPU, 900,
                ArquiteturaPlataforma.INTEL_LGA1700, null, 0, 0, 65, 0, 3));
        lista.add(produto("Intel Core i5-14600KF (14 nucleos, LGA1700)", TipoComponente.CPU, 1800,
                ArquiteturaPlataforma.INTEL_LGA1700, null, 0, 0, 125, 0, 3));
        lista.add(produto("Intel Core i7-13700K (16 nucleos, LGA1700)", TipoComponente.CPU, 2600,
                ArquiteturaPlataforma.INTEL_LGA1700, null, 0, 0, 125, 0, 4));

        // CPU - Intel LGA1851
        lista.add(produto("Intel Core Ultra 5 245K (LGA1851)", TipoComponente.CPU, 2200,
                ArquiteturaPlataforma.INTEL_LGA1851, null, 0, 0, 125, 0, 3));
        lista.add(produto("Intel Core Ultra 7 265K (LGA1851)", TipoComponente.CPU, 3200,
                ArquiteturaPlataforma.INTEL_LGA1851, null, 0, 0, 125, 0, 4));

        // GPU
        lista.add(produto("GeForce GTX 1650 4GB", TipoComponente.GPU, 850,
                null, null, 0, 0, 75, 0, 1));
        lista.add(produto("Radeon RX 6600 8GB", TipoComponente.GPU, 1400,
                null, null, 0, 0, 132, 0, 2));
        lista.add(produto("GeForce RTX 3060 12GB", TipoComponente.GPU, 1800,
                null, null, 0, 0, 170, 0, 3));
        lista.add(produto("Radeon RX 7600 8GB", TipoComponente.GPU, 1750,
                null, null, 0, 0, 165, 0, 3));
        lista.add(produto("GeForce RTX 4060 8GB", TipoComponente.GPU, 2100,
                null, null, 0, 0, 115, 0, 3));
        lista.add(produto("GeForce RTX 4070 Super 12GB", TipoComponente.GPU, 4200,
                null, null, 0, 0, 220, 0, 4));
        lista.add(produto("GeForce RTX 4080 Super 16GB", TipoComponente.GPU, 9000,
                null, null, 0, 0, 320, 0, 4));
        lista.add(produto("GeForce RTX 4090 24GB", TipoComponente.GPU, 15000,
                null, null, 0, 0, 450, 0, 4));

        // RAM DDR4
        lista.add(produto("Memoria 16GB (2x8GB) DDR4 3200MHz", TipoComponente.RAM, 350,
                null, TipoRam.DDR4, 2, 0, 0, 0, 3));
        lista.add(produto("Memoria 32GB (2x16GB) DDR4 3200MHz", TipoComponente.RAM, 700,
                null, TipoRam.DDR4, 2, 0, 0, 0, 4));

        // RAM DDR5
        lista.add(produto("Memoria 16GB (2x8GB) DDR5 5600MHz", TipoComponente.RAM, 500,
                null, TipoRam.DDR5, 2, 0, 0, 0, 3));
        lista.add(produto("Memoria 32GB (2x16GB) DDR5 6000MHz", TipoComponente.RAM, 1150,
                null, TipoRam.DDR5, 2, 0, 0, 0, 4));

        // Placas-mae
        lista.add(produto("Placa-mae A520M (AM4, DDR4)", TipoComponente.PLACA_MAE, 550,
                ArquiteturaPlataforma.AMD_AM4, TipoRam.DDR4, 0, 4, 0, 0, 2));
        lista.add(produto("Placa-mae B550M (AM4, DDR4)", TipoComponente.PLACA_MAE, 800,
                ArquiteturaPlataforma.AMD_AM4, TipoRam.DDR4, 0, 4, 0, 0, 3));
        lista.add(produto("Placa-mae B650M (AM5, DDR5)", TipoComponente.PLACA_MAE, 1200,
                ArquiteturaPlataforma.AMD_AM5, TipoRam.DDR5, 0, 4, 0, 0, 3));
        lista.add(produto("Placa-mae X670E (AM5, DDR5)", TipoComponente.PLACA_MAE, 2300,
                ArquiteturaPlataforma.AMD_AM5, TipoRam.DDR5, 0, 4, 0, 0, 4));
        lista.add(produto("Placa-mae H610M (LGA1700, DDR4)", TipoComponente.PLACA_MAE, 650,
                ArquiteturaPlataforma.INTEL_LGA1700, TipoRam.DDR4, 0, 2, 0, 0, 2));
        lista.add(produto("Placa-mae B760M (LGA1700, DDR5)", TipoComponente.PLACA_MAE, 1100,
                ArquiteturaPlataforma.INTEL_LGA1700, TipoRam.DDR5, 0, 4, 0, 0, 3));
        lista.add(produto("Placa-mae Z790 (LGA1700, DDR5)", TipoComponente.PLACA_MAE, 2000,
                ArquiteturaPlataforma.INTEL_LGA1700, TipoRam.DDR5, 0, 4, 0, 0, 4));
        lista.add(produto("Placa-mae B860M (LGA1851, DDR5)", TipoComponente.PLACA_MAE, 1500,
                ArquiteturaPlataforma.INTEL_LGA1851, TipoRam.DDR5, 0, 4, 0, 0, 3));

        // Fontes
        lista.add(produto("Fonte 500W 80 Plus Bronze", TipoComponente.FONTE, 300,
                null, null, 0, 0, 0, 500, 2));
        lista.add(produto("Fonte 650W 80 Plus Bronze", TipoComponente.FONTE, 450,
                null, null, 0, 0, 0, 650, 3));
        lista.add(produto("Fonte 750W 80 Plus Gold", TipoComponente.FONTE, 650,
                null, null, 0, 0, 0, 750, 4));
        lista.add(produto("Fonte 850W 80 Plus Gold", TipoComponente.FONTE, 850,
                null, null, 0, 0, 0, 850, 4));

        // Gabinetes
        lista.add(produto("Gabinete Mid Tower (acrilico)", TipoComponente.GABINETE, 250,
                null, null, 0, 0, 0, 0, 2));
        lista.add(produto("Gabinete Mid Tower Vidro Temperado", TipoComponente.GABINETE, 420,
                null, null, 0, 0, 0, 0, 3));

        // Armazenamento
        lista.add(produto("SSD 512GB NVMe", TipoComponente.ARMAZENAMENTO, 300,
                null, null, 0, 0, 0, 0, 2));
        lista.add(produto("SSD 1TB NVMe", TipoComponente.ARMAZENAMENTO, 550,
                null, null, 0, 0, 0, 0, 3));
        lista.add(produto("SSD 2TB NVMe", TipoComponente.ARMAZENAMENTO, 1050,
                null, null, 0, 0, 0, 0, 4));

        // Perifericos
        lista.add(produto("Kit Teclado + Mouse USB", TipoComponente.PERIFERICO, 150,
                null, null, 0, 0, 0, 0, 1));
        lista.add(produto("Mouse Gamer RGB 6400DPI", TipoComponente.PERIFERICO, 220,
                null, null, 0, 0, 0, 0, 2));
        lista.add(produto("Monitor 24\" Full HD 100Hz", TipoComponente.PERIFERICO, 800,
                null, null, 0, 0, 0, 0, 2));
        lista.add(produto("Monitor 27\" QHD 165Hz", TipoComponente.PERIFERICO, 1600,
                null, null, 0, 0, 0, 0, 3));

        return lista;
    }

    private Produto produto(String nome, TipoComponente categoria, double preco,
                            ArquiteturaPlataforma plataforma, TipoRam tipoMemoria,
                            int slotsReq, int slotsForn, int consumo, int potencia, int peso) {
        Produto p = new Produto();
        p.setNome(nome);
        p.setCategoria(categoria);
        p.setPreco(BigDecimal.valueOf(preco));
        p.setLinkAfiliado("https://exemplo.com/busca?q="
                + nome.toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        p.setPlataforma(plataforma);
        p.setTipoMemoria(tipoMemoria);
        p.setSlotsRamRequeridos(slotsReq);
        p.setSlotsRamFornecidos(slotsForn);
        p.setConsumoWatts(consumo);
        p.setPotenciaWattsFornecida(potencia);
        p.setPesoDesempenho(peso);
        return p;
    }

    private List<Jogo> seedJogos() {
        List<Jogo> jogos = new ArrayList<>();
        jogos.add(jogo("Estudos", "OBJETIVO", 2, 1, 2));
        jogos.add(jogo("Trabalho", "OBJETIVO", 3, 2, 3));
        jogos.add(jogo("Lazer", "OBJETIVO", 1, 2, 1));
        jogos.add(jogo("Escritorio", "OBJETIVO", 2, 1, 2));
        jogos.add(jogo("Roblox", "JOGO", 2, 3, 2));
        jogos.add(jogo("Fortnite", "JOGO", 2, 3, 2));
        jogos.add(jogo("GTA 6", "JOGO", 3, 4, 4));
        jogos.add(jogo("Cities Skylines 2", "JOGO", 4, 3, 4));
        return jogos;
    }

    private Jogo jogo(String nome, String tipo, int pesoCpu, int pesoGpu, int pesoRam) {
        Jogo j = new Jogo();
        j.setNome(nome);
        j.setTipo(tipo);
        j.setPesoCpu(pesoCpu);
        j.setPesoGpu(pesoGpu);
        j.setPesoRam(pesoRam);
        return j;
    }

    private void seedReceitas(List<Produto> produtos) {
        ReceitaBase am4 = receita("Receita AMD AM4 - Custo-Beneficio", "AMD", 11,
                byName(produtos, "AMD Ryzen 5 5600"),
                byName(produtos, "Placa-mae B550M"),
                byName(produtos, "Memoria 16GB (2x8GB) DDR4"),
                byName(produtos, "Radeon RX 7600"),
                byName(produtos, "Fonte 650W"),
                byName(produtos, "SSD 512GB"),
                byName(produtos, "Gabinete Mid Tower (acrilico)"));
        receitaBaseRepository.save(am4);

        ReceitaBase am5 = receita("Receita AMD AM5 - Entusiasta", "AMD", 15,
                byName(produtos, "AMD Ryzen 7 7800X3D"),
                byName(produtos, "Placa-mae X670E"),
                byName(produtos, "Memoria 32GB (2x16GB) DDR5"),
                byName(produtos, "GeForce RTX 4070 Super"),
                byName(produtos, "Fonte 750W"),
                byName(produtos, "SSD 1TB"),
                byName(produtos, "Gabinete Mid Tower Vidro Temperado"));
        receitaBaseRepository.save(am5);

        ReceitaBase intel1700 = receita("Receita Intel LGA1700 - Custo-Beneficio", "INTEL", 11,
                byName(produtos, "Intel Core i5-12400F"),
                byName(produtos, "Placa-mae B760M"),
                byName(produtos, "Memoria 16GB (2x8GB) DDR5"),
                byName(produtos, "GeForce RTX 4060"),
                byName(produtos, "Fonte 650W"),
                byName(produtos, "SSD 1TB"),
                byName(produtos, "Gabinete Mid Tower (acrilico)"));
        receitaBaseRepository.save(intel1700);

        ReceitaBase intel1851 = receita("Receita Intel LGA1851 - High-end", "INTEL", 16,
                byName(produtos, "Intel Core Ultra 7 265K"),
                byName(produtos, "Placa-mae B860M"),
                byName(produtos, "Memoria 32GB (2x16GB) DDR5"),
                byName(produtos, "GeForce RTX 4080 Super"),
                byName(produtos, "Fonte 850W"),
                byName(produtos, "SSD 2TB"),
                byName(produtos, "Gabinete Mid Tower Vidro Temperado"));
        receitaBaseRepository.save(intel1851);
    }

    private ReceitaBase receita(String nome, String marca, int pesoGeral, Produto... itens) {
        ReceitaBase r = new ReceitaBase();
        r.setNome(nome);
        r.setArquiteturaMarca(marca);
        r.setPesoGeralCalculado(pesoGeral);
        r.getItens().addAll(List.of(itens));
        return r;
    }

    private Produto byName(List<Produto> produtos, String parteDoNome) {
        return produtos.stream()
                .filter(p -> p.getNome().contains(parteDoNome))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Produto nao encontrado: " + parteDoNome));
    }
}
