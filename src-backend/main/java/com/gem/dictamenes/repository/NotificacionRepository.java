package com.gem.dictamenes.repository;

import com.gem.dictamenes.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByDestinatarioRolAndLeidaFalseOrderByFechaDesc(String destinatarioRol);
    long countByDestinatarioRolAndLeidaFalse(String destinatarioRol);
}
