package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.CatalogoItem;
import com.gem.dictamenes.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    @Autowired
    private CatalogoService catalogoService;

    // Obtener elementos activos (para selects de formularios y filtros)
    @GetMapping("/{tipo}")
    public ResponseEntity<List<CatalogoItem>> listarActivos(@PathVariable String tipo) {
        return ResponseEntity.ok(catalogoService.listarActivosPorTipo(tipo.toUpperCase()));
    }

    // Obtener todos los elementos (activos e inactivos, para pantalla de administración)
    @GetMapping("/{tipo}/admin")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<CatalogoItem>> listarTodosAdmin(@PathVariable String tipo) {
        return ResponseEntity.ok(catalogoService.listarTodosPorTipo(tipo.toUpperCase()));
    }

    // Crear nuevo elemento (solo ADMIN)
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crear(@RequestBody CatalogoItem item) {
        try {
            if (item.getTipo() != null) {
                item.setTipo(item.getTipo().toUpperCase());
            }
            CatalogoItem creado = catalogoService.guardar(item);
            return ResponseEntity.ok(creado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar elemento (solo ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody CatalogoItem item) {
        try {
            CatalogoItem actualizado = catalogoService.actualizar(id, item);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Alternar estatus activo / inactivo (solo ADMIN)
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> toggleActivo(@PathVariable Long id) {
        try {
            CatalogoItem modificado = catalogoService.toggleActivo(id);
            return ResponseEntity.ok(modificado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Eliminar elemento de catálogo (solo ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            catalogoService.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Elemento eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se pudo eliminar el elemento"));
        }
    }
}
