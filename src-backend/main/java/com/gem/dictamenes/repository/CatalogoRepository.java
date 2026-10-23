package com.gem.dictamenes.repository;

import com.gem.dictamenes.model.CatalogoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogoRepository extends JpaRepository<CatalogoItem, Long> {
    List<CatalogoItem> findByTipoOrderByOrdenAscNombreAsc(String tipo);
    List<CatalogoItem> findByTipoAndActivoTrueOrderByOrdenAscNombreAsc(String tipo);
    boolean existsByTipoAndNombreIgnoreCase(String tipo, String nombre);
}
