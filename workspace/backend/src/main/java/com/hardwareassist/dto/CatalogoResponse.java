package com.hardwareassist.dto;

import com.hardwareassist.domain.Jogo;

import java.util.List;

public record CatalogoResponse(
        List<ProdutoDTO> produtos,
        List<JogoDTO> jogos,
        List<ReceitaDTO> receitas) {
}
