package com.hardwareassist.dto;

import com.hardwareassist.domain.ArquiteturaPlataforma;
import com.hardwareassist.domain.Produto;
import com.hardwareassist.domain.TipoComponente;
import com.hardwareassist.domain.TipoRam;

import java.math.BigDecimal;

public record ProdutoDTO(
        Long id,
        String nome,
        String categoria,
        BigDecimal preco,
        String linkAfiliado,
        ArquiteturaPlataforma plataforma,
        TipoRam tipoMemoria,
        Integer slotsRamRequeridos,
        Integer slotsRamFornecidos,
        Integer consumoWatts,
        Integer potenciaWattsFornecida,
        Integer pesoDesempenho) {

    public static ProdutoDTO from(Produto p) {
        return new ProdutoDTO(
                p.getId(),
                p.getNome(),
                p.getCategoria() != null ? p.getCategoria().name() : null,
                p.getPreco(),
                p.getLinkAfiliado(),
                p.getPlataforma(),
                p.getTipoMemoria(),
                p.getSlotsRamRequeridos(),
                p.getSlotsRamFornecidos(),
                p.getConsumoWatts(),
                p.getPotenciaWattsFornecida(),
                p.getPesoDesempenho());
    }
}
