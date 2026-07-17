package com.gem.dictamenes.repository;

import com.gem.dictamenes.model.AuditoriaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaRepository extends JpaRepository<AuditoriaLog, Long> {
}
