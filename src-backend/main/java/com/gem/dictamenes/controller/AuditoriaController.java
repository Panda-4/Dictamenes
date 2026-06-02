package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.repository.AuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaRepository repository;

    @Autowired
    public AuditoriaController(AuditoriaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<AuditoriaLog> getAuditoria(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "accion", required = false) String accion,
            @RequestParam(value = "usuario", required = false) String usuario,
            @RequestParam(value = "fechaDesde", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(value = "fechaHasta", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return repository.findByFilters(accion, usuario, fechaDesde, fechaHasta, pageable);
    }

    /** Endpoint de accesos (solo INICIO_SESIÓN) */
    @GetMapping("/accesos")
    public Page<AuditoriaLog> getAccesos(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "usuario", required = false) String usuario,
            @RequestParam(value = "fechaDesde", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(value = "fechaHasta", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return repository.findByFilters("INICIO_SESIÓN", usuario, fechaDesde, fechaHasta, pageable);
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", repository.count());
        stats.put("creaciones", repository.countByAccion("CREACIÓN"));
        stats.put("actualizaciones", repository.countByAccion("ACTUALIZACIÓN"));
        stats.put("eliminaciones", repository.countByAccion("ELIMINACIÓN"));
        stats.put("accesos", repository.countByAccion("INICIO_SESIÓN"));
        return stats;
    }

    @GetMapping("/export")
    public void exportToCSV(
            @RequestParam(value = "accion", required = false) String accion,
            @RequestParam(value = "usuario", required = false) String usuario,
            @RequestParam(value = "fechaDesde", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(value = "fechaHasta", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            HttpServletResponse response
    ) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"auditoria_logs.csv\"");

        List<AuditoriaLog> logs = repository.findByFilters(
                accion, usuario, fechaDesde, fechaHasta,
                PageRequest.of(0, 100000, Sort.by("id").descending())
        ).getContent();

        PrintWriter writer = response.getWriter();
        // Write UTF-8 BOM for Excel compatibility
        writer.write('\ufeff');
        writer.println("ID,Fecha,Usuario,Rol,Acción,Entidad,Detalle,IP,Dispositivo");

        for (AuditoriaLog log : logs) {
            writer.println(String.format("%d,%s,%s,%s,%s,%s,\"%s\",%s,%s",
                    log.getId(),
                    log.getFecha() != null ? log.getFecha().toString().replace("T", " ").substring(0, 19) : "",
                    escapeCsv(log.getUsuario()),
                    escapeCsv(log.getRol()),
                    escapeCsv(log.getAccion()),
                    escapeCsv(log.getEntidad()),
                    escapeCsv(log.getDetalle()),
                    escapeCsv(log.getIp()),
                    escapeCsv(log.getDispositivo())
            ));
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
