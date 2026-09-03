package com.hardwareassist.dto;

import java.math.BigDecimal;
import java.util.List;

public record RecomendacaoResponse(
        String plataforma,
        String receitaNome,
        List<ItemMontagem> itens,
        BigDecimal total,
        Integer pesoGeralCalculado,
        List<String> observacoes) {

    public record ItemMontagem(
            Long id,
            String nome,
            String categoria,
            BigDecimal preco,
            String linkAfiliado,
            String plataforma,
            String tipoMemoria,
            String destaque) {
    }
}
