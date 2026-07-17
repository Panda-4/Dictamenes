package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.Solicitud;
import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.service.SolicitudService;
import com.gem.dictamenes.util.ExcelHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    @Autowired
    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<Solicitud> getAll() {
        return solicitudService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> getById(@PathVariable Long id) {
        Solicitud solicitud = solicitudService.findById(id);
        return solicitud != null ? ResponseEntity.ok(solicitud) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<AuditoriaLog>> getHistorial(@PathVariable Long id) {
        List<AuditoriaLog> logs = solicitudService.getHistorial(id);
        return ResponseEntity.ok(logs);
    }

    @PostMapping
    public Solicitud create(@Valid @RequestBody Solicitud solicitud) {
        return solicitudService.save(solicitud);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Solicitud> update(@PathVariable Long id, @Valid @RequestBody Solicitud solicitud) {
        solicitud.setFolioInterno(id);
        Solicitud updated = solicitudService.save(solicitud);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        solicitudService.delete(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Solicitud eliminada"));
    }

    /** Exportar todo el listado como archivo Excel (.xlsx) con todos los campos */
    @GetMapping("/export/excel")
    public void exportarExcel(HttpServletResponse response) throws IOException {
        List<Solicitud> solicitudes = solicitudService.findAll();
        byte[] excelBytes = ExcelHelper.solicitudesToExcel(solicitudes);

        String filename = "reporte_general_solicitudes_" + java.time.LocalDate.now() + ".xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        response.setContentLength(excelBytes.length);
        response.getOutputStream().write(excelBytes);
        response.getOutputStream().flush();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/import/template")
    public void descargarPlantilla(HttpServletResponse response) throws IOException {
        byte[] excelBytes = ExcelHelper.generateTemplate();
        String filename = "plantilla_importacion_solicitudes.xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        response.setContentLength(excelBytes.length);
        response.getOutputStream().write(excelBytes);
        response.getOutputStream().flush();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/import/preview")
    public ResponseEntity<com.gem.dictamenes.dto.ExcelImportDto> previsualizarImportacion(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws IOException {
        com.gem.dictamenes.dto.ExcelImportDto dto = solicitudService.previewImport(file);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/import/confirm")
    public ResponseEntity<?> confirmarImportacion(@RequestBody List<Solicitud> solicitudes) {
        solicitudService.confirmImport(solicitudes);
        return ResponseEntity.ok(java.util.Map.of("message", "Importación masiva completada con éxito."));
    }
}
