package com.hardwareassist.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record RecomendacaoRequest(
        @NotNull
        @DecimalMin("300")
        BigDecimal orcamento,
        List<Long> jogoIds,
        String marca,
        Boolean incluiPerifericos) {

    public boolean comPerifericos() {
        return Boolean.TRUE.equals(incluiPerifericos);
    }
}
