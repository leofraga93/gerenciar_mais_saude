package com.hardwareassist.dto;

import com.hardwareassist.domain.Jogo;

public record JogoDTO(
        Long id,
        String nome,
        String imagemUrl,
        String tipo,
        Integer pesoCpu,
        Integer pesoGpu,
        Integer pesoRam) {

    public static JogoDTO from(Jogo j) {
        return new JogoDTO(j.getId(), j.getNome(), j.getImagemUrl(), j.getTipo(),
                j.getPesoCpu(), j.getPesoGpu(), j.getPesoRam());
    }
}
