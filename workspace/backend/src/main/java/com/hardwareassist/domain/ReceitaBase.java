package com.hardwareassist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "receitas_base")
@Getter
@Setter
@NoArgsConstructor
public class ReceitaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "arquitetura_marca", nullable = false, length = 10)
    private String arquiteturaMarca;

    @Column(name = "peso_geral_calculado", nullable = false)
    private Integer pesoGeralCalculado;

    @ManyToMany
    @JoinTable(
            name = "itens_receita",
            joinColumns = @JoinColumn(name = "receita_id"),
            inverseJoinColumns = @JoinColumn(name = "produto_id"))
    private Set<Produto> itens = new HashSet<>();
}
