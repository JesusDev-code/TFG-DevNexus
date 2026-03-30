package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Departamento
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DepartamentoRepository : JpaRepository<Departamento, Int>