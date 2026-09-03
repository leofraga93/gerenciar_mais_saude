package com.hardwareassist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoComponente categoria;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "link_afiliado", nullable = false, columnDefinition = "TEXT")
    private String linkAfiliado;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ArquiteturaPlataforma plataforma;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_memoria", length = 10)
    private TipoRam tipoMemoria;

    @Column(name = "slots_ram_requeridos", columnDefinition = "INT DEFAULT 0")
    private Integer slotsRamRequeridos = 0;

    @Column(name = "slots_ram_fornecidos", columnDefinition = "INT DEFAULT 0")
    private Integer slotsRamFornecidos = 0;

    @Column(name = "consumo_watts", columnDefinition = "INT DEFAULT 0")
    private Integer consumoWatts = 0;

    @Column(name = "potencia_watts_fornecida", columnDefinition = "INT DEFAULT 0")
    private Integer potenciaWattsFornecida = 0;

    @Min(1)
    @Max(4)
    @Column(name = "peso_desempenho", nullable = false)
    private Integer pesoDesempenho;
}
