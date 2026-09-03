package com.hardwareassist.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SubstituicaoRequest(
        @NotNull
        Long produtoId,
        List<Long> montagemIds) {
}
