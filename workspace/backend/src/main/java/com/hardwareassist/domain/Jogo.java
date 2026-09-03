package com.hardwareassist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Table(name = "jogos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Jogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "imagem_url", columnDefinition = "TEXT")
    private String imagemUrl;

    @Column(nullable = false, length = 10)
    private String tipo = "JOGO";

    @Min(1)
    @Max(4)
    @Column(name = "peso_cpu", nullable = false)
    private Integer pesoCpu;

    @Min(1)
    @Max(4)
    @Column(name = "peso_gpu", nullable = false)
    private Integer pesoGpu;

    @Min(1)
    @Max(4)
    @Column(name = "peso_ram", nullable = false)
    private Integer pesoRam;
}
