package com.gem.dictamenes.service;

import com.gem.dictamenes.model.Rol;
import com.gem.dictamenes.model.RolPermiso;
import com.gem.dictamenes.repository.RolPermisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RolPermisoService {

    @Autowired
    private RolPermisoRepository rolPermisoRepository;

    public static final List<String> PERMISOS_DISPONIBLES = List.of(
        "SOLICITUDES_CREAR",
        "SOLICITUDES_EDITAR",
        "SOLICITUDES_ELIMINAR",
        "SOLICITUDES_VALIDAR",
        "VER_DASHBOARD",
        "EXPORTAR_DATOS",
        "VER_AUDITORIA",
        "ADMIN_CATALOGOS"
    );

    @Transactional
    public void inicializarPermisosPorDefecto() {
        Map<String, Map<String, Boolean>> defaults = new HashMap<>();

        // ADMINISTRADOR
        defaults.put("ADMINISTRADOR", Map.of(
            "SOLICITUDES_CREAR", true,
            "SOLICITUDES_EDITAR", true,
            "SOLICITUDES_ELIMINAR", true,
            "SOLICITUDES_VALIDAR", true,
            "VER_DASHBOARD", true,
            "EXPORTAR_DATOS", true,
            "VER_AUDITORIA", true,
            "ADMIN_CATALOGOS", true
        ));

        // AUTORIZADOR
        defaults.put("AUTORIZADOR", Map.of(
            "SOLICITUDES_CREAR", false,
            "SOLICITUDES_EDITAR", false,
            "SOLICITUDES_ELIMINAR", false,
            "SOLICITUDES_VALIDAR", true,
            "VER_DASHBOARD", true,
            "EXPORTAR_DATOS", true,
            "VER_AUDITORIA", true,
            "ADMIN_CATALOGOS", false
        ));

        // CAPTURISTA
        defaults.put("CAPTURISTA", Map.of(
            "SOLICITUDES_CREAR", true,
            "SOLICITUDES_EDITAR", false, // Deshabilitado por default; admin puede habilitarlo dinámicamente
            "SOLICITUDES_ELIMINAR", false,
            "SOLICITUDES_VALIDAR", false,
            "VER_DASHBOARD", true,
            "EXPORTAR_DATOS", true,
            "VER_AUDITORIA", false,
            "ADMIN_CATALOGOS", false
        ));

        // CONSULTA
        defaults.put("CONSULTA", Map.of(
            "SOLICITUDES_CREAR", false,
            "SOLICITUDES_EDITAR", false,
            "SOLICITUDES_ELIMINAR", false,
            "SOLICITUDES_VALIDAR", false,
            "VER_DASHBOARD", true,
            "EXPORTAR_DATOS", true,
            "VER_AUDITORIA", false,
            "ADMIN_CATALOGOS", false
        ));

        for (Rol rol : Rol.values()) {
            String rolStr = rol.name();
            Map<String, Boolean> permisosRol = defaults.getOrDefault(rolStr, Collections.emptyMap());
            for (String permiso : PERMISOS_DISPONIBLES) {
                if (!rolPermisoRepository.existsByRolAndPermiso(rolStr, permiso)) {
                    boolean valorPorDefecto = permisosRol.getOrDefault(permiso, false);
                    rolPermisoRepository.save(new RolPermiso(rolStr, permiso, valorPorDefecto));
                }
            }
        }
    }

    public List<RolPermiso> obtenerTodos() {
        return rolPermisoRepository.findAll();
    }

    public List<RolPermiso> obtenerPorRol(String rol) {
        return rolPermisoRepository.findByRol(rol.toUpperCase());
    }

    public List<String> obtenerPermisosHabilitados(String rol) {
        if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
            return new ArrayList<>(PERMISOS_DISPONIBLES);
        }
        return rolPermisoRepository.findByRolAndHabilitadoTrue(rol.toUpperCase())
                .stream()
                .map(RolPermiso::getPermiso)
                .collect(Collectors.toList());
    }

    @Transactional
    public RolPermiso togglePermiso(String rol, String permiso, Boolean habilitado) {
        if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
            throw new IllegalArgumentException("No es posible modificar los privilegios del rol ADMINISTRADOR para preservar la integridad del sistema.");
        }

        RolPermiso rolPermiso = rolPermisoRepository.findByRolAndPermiso(rol.toUpperCase(), permiso.toUpperCase())
                .orElseGet(() -> new RolPermiso(rol.toUpperCase(), permiso.toUpperCase(), habilitado));

        rolPermiso.setHabilitado(habilitado);
        return rolPermisoRepository.save(rolPermiso);
    }
}
