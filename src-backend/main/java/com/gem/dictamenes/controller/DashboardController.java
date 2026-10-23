package com.gem.dictamenes.controller;

import com.gem.dictamenes.repository.SolicitudRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final SolicitudRepository repository;

    @Autowired
    public DashboardController(SolicitudRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalSolicitudes", repository.count());
        stats.put("enTramite",
            repository.countByEstatusGeneral("En Opinión Técnica de Subdirección de Fianzas y Seguros")
            + repository.countByEstatusGeneral("En proceso de elaboración")
            + repository.countByEstatusGeneral("En Firma de Dirección General")
            + repository.countByEstatusGeneral("En autorización de la OM"));
        stats.put("enAutorizacionOM", repository.countByEstatusGeneral("En autorización de la OM"));
        stats.put("concluidas", repository.countByEstatusGeneral("Concluido Entregado a dependencia solicitante"));

        stats.put("montoTotal", repository.sumMontoTotal());
        stats.put("montoConcluido", repository.sumMontoByEstatus("Concluido Entregado a dependencia solicitante"));
        // Monto en trámite = todo lo que NO está concluido
        // Usar ZERO si no hay registros para ese estatus (evita NullPointerException)
        java.math.BigDecimal montoOpinion  = coalesce(repository.sumMontoByEstatus("En Opinión Técnica de Subdirección de Fianzas y Seguros"));
        java.math.BigDecimal montoProceso  = coalesce(repository.sumMontoByEstatus("En proceso de elaboración"));
        java.math.BigDecimal montoFirma    = coalesce(repository.sumMontoByEstatus("En Firma de Dirección General"));
        java.math.BigDecimal montoAutOM    = coalesce(repository.sumMontoByEstatus("En autorización de la OM"));
        stats.put("montoEnTramite", montoOpinion.add(montoProceso).add(montoFirma).add(montoAutOM));


        // Breakdown por tipo
        Map<String, Long> porTipo = new HashMap<>();
        porTipo.put("Dictamen Técnico", repository.countByTipoSolicitud("Dictamen Técnico"));
        porTipo.put("Dictamen de Procedencia", repository.countByTipoSolicitud("Dictamen de Procedencia"));
        porTipo.put("Opinión Técnica Previa", repository.countByTipoSolicitud("Opinión Técnica Previa"));
        porTipo.put("Dictamen Previo", repository.countByTipoSolicitud("Dictamen Previo"));
        porTipo.put("Excepción a Medidas de Austeridad", repository.countByTipoSolicitud("Excepción a Medidas de Austeridad"));
        stats.put("porTipo", porTipo);

        return stats;
    }

    /** Devuelve el valor o BigDecimal.ZERO si es null — evita NullPointerException en sumas. */
    private java.math.BigDecimal coalesce(java.math.BigDecimal value) {
        return value != null ? value : java.math.BigDecimal.ZERO;
    }
}
