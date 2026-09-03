package com.hardwareassist.repository;

import com.hardwareassist.domain.ReceitaBase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceitaBaseRepository extends JpaRepository<ReceitaBase, Long> {

    List<ReceitaBase> findByArquiteturaMarca(String arquiteturaMarca);
}
