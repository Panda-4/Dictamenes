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
        java.math.BigDecimal montoOpinion = repository.sumMontoByEstatus("En Opinión Técnica de Subdirección de Fianzas y Seguros");
        java.math.BigDecimal montoProceso = repository.sumMontoByEstatus("En proceso de elaboración");
        java.math.BigDecimal montoFirma = repository.sumMontoByEstatus("En Firma de Dirección General");
        java.math.BigDecimal montoAutOM = repository.sumMontoByEstatus("En autorización de la OM");
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
}
