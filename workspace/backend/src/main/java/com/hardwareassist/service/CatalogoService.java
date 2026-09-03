package com.hardwareassist.service;

import com.hardwareassist.domain.Produto;
import com.hardwareassist.domain.ReceitaBase;
import com.hardwareassist.dto.CatalogoResponse;
import com.hardwareassist.dto.JogoDTO;
import com.hardwareassist.dto.ProdutoDTO;
import com.hardwareassist.dto.ReceitaDTO;
import com.hardwareassist.repository.JogoRepository;
import com.hardwareassist.repository.ProdutoRepository;
import com.hardwareassist.repository.ReceitaBaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class CatalogoService {

    private final ProdutoRepository produtoRepository;
    private final JogoRepository jogoRepository;
    private final ReceitaBaseRepository receitaBaseRepository;

    public CatalogoService(ProdutoRepository produtoRepository,
                           JogoRepository jogoRepository,
                           ReceitaBaseRepository receitaBaseRepository) {
        this.produtoRepository = produtoRepository;
        this.jogoRepository = jogoRepository;
        this.receitaBaseRepository = receitaBaseRepository;
    }

    @Transactional(readOnly = true)
    public CatalogoResponse obterCatalogo() {
        List<ProdutoDTO> produtos = produtoRepository.findAll().stream()
                .sorted(Comparator.comparing(Produto::getCategoria)
                        .thenComparing(Produto::getPesoDesempenho, Comparator.reverseOrder()))
                .map(ProdutoDTO::from)
                .toList();

        List<JogoDTO> jogos = jogoRepository.findAll().stream()
                .map(JogoDTO::from)
                .toList();

        List<ReceitaDTO> receitas = receitaBaseRepository.findAll().stream()
                .map(ReceitaDTO::from)
                .toList();

        return new CatalogoResponse(produtos, jogos, receitas);
    }
}
