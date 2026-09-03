package com.hardwareassist.repository;

import com.hardwareassist.domain.ArquiteturaPlataforma;
import com.hardwareassist.domain.Produto;
import com.hardwareassist.domain.TipoComponente;
import com.hardwareassist.domain.TipoRam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByCategoria(TipoComponente categoria);

    List<Produto> findByCategoriaAndPlataforma(TipoComponente categoria, ArquiteturaPlataforma plataforma);

    List<Produto> findByCategoriaAndTipoMemoria(TipoComponente categoria, TipoRam tipoMemoria);
}
