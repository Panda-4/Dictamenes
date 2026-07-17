package com.gem.dictamenes.repository;

import com.gem.dictamenes.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    long countByEstatusGeneral(String estatusGeneral);
    long countByTipoSolicitud(String tipoSolicitud);

    @Query("SELECT COALESCE(SUM(s.montoSolicitud), 0) FROM Solicitud s")
    BigDecimal sumMontoTotal();

    @Query("SELECT COALESCE(SUM(s.montoSolicitud), 0) FROM Solicitud s WHERE s.estatusGeneral = :estatus")
    BigDecimal sumMontoByEstatus(@Param("estatus") String estatus);

    java.util.Optional<Solicitud> findByNumeroOficioSolicitud(String numeroOficioSolicitud);
}
