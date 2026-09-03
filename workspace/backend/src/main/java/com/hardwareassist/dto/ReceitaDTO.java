package com.hardwareassist.dto;

import com.hardwareassist.domain.ReceitaBase;

import java.util.List;

public record ReceitaDTO(
        Long id,
        String nome,
        String arquiteturaMarca,
        Integer pesoGeralCalculado,
        List<ProdutoDTO> itens) {

    public static ReceitaDTO from(ReceitaBase r) {
        List<ProdutoDTO> itens = r.getItens().stream()
                .map(ProdutoDTO::from)
                .sorted((a, b) -> b.pesoDesempenho() - a.pesoDesempenho())
                .toList();
        return new ReceitaDTO(r.getId(), r.getNome(), r.getArquiteturaMarca(),
                r.getPesoGeralCalculado(), itens);
    }
}
