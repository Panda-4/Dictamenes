package com.gem.dictamenes.repository;

import com.gem.dictamenes.model.RolPermiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolPermisoRepository extends JpaRepository<RolPermiso, Long> {
    List<RolPermiso> findByRol(String rol);
    Optional<RolPermiso> findByRolAndPermiso(String rol, String permiso);
    boolean existsByRolAndPermiso(String rol, String permiso);
    List<RolPermiso> findByRolAndHabilitadoTrue(String rol);
}
