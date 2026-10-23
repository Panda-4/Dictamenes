package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.RolPermiso;
import com.gem.dictamenes.model.Usuario;
import com.gem.dictamenes.service.RolPermisoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
public class RolPermisoController {

    @Autowired
    private RolPermisoService rolPermisoService;

    // Obtener la matriz completa de permisos por rol (ADMINISTRADOR)
    @GetMapping("/permisos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<RolPermiso>> obtenerTodos() {
        return ResponseEntity.ok(rolPermisoService.obtenerTodos());
    }

    // Obtener los permisos asignados a un rol específico
    @GetMapping("/{rol}/permisos")
    public ResponseEntity<List<RolPermiso>> obtenerPorRol(@PathVariable String rol) {
        return ResponseEntity.ok(rolPermisoService.obtenerPorRol(rol));
    }

    // Obtener las claves de permisos activos para el usuario logueado actualmente
    @GetMapping("/mis-permisos")
    public ResponseEntity<List<String>> misPermisos(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(List.of());
        }

        String rol = "CONSULTA";
        if (authentication.getPrincipal() instanceof Usuario usuario) {
            rol = usuario.getRol().name();
        } else {
            // Extraer rol de authorities si no es instancia de Usuario
            rol = authentication.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("CONSULTA");
        }

        return ResponseEntity.ok(rolPermisoService.obtenerPermisosHabilitados(rol));
    }

    // Modificar / conmutar un permiso para un rol específico (ADMINISTRADOR)
    @PutMapping("/{rol}/permisos/{permiso}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> togglePermiso(
            @PathVariable String rol,
            @PathVariable String permiso,
            @RequestBody Map<String, Boolean> body) {
        try {
            Boolean habilitado = body.getOrDefault("habilitado", true);
            RolPermiso actualizado = rolPermisoService.togglePermiso(rol, permiso, habilitado);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al actualizar permiso: " + e.getMessage()));
        }
    }
}
