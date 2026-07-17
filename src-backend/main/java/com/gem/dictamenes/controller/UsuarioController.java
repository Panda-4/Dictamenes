package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.Rol;
import com.gem.dictamenes.model.Usuario;
import com.gem.dictamenes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Usuario> getAll() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        // No devolver contraseñas hasheadas al frontend
        usuarios.forEach(u -> u.setPassword(null));
        return usuarios;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (usuarioRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "El nombre de usuario ya existe"));
        }

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(body.get("nombreCompleto"));
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(body.get("password")));
        usuario.setRol(Rol.valueOf(body.getOrDefault("rol", "CAPTURISTA")));
        usuario.setDependencia(body.get("dependencia"));
        usuario.setActivo(true);
        usuario.setFechaCreacion(LocalDateTime.now());

        Usuario saved = usuarioRepository.save(usuario);
        saved.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    if (body.containsKey("nombreCompleto")) usuario.setNombreCompleto(body.get("nombreCompleto"));
                    if (body.containsKey("dependencia")) usuario.setDependencia(body.get("dependencia"));
                    if (body.containsKey("rol")) usuario.setRol(Rol.valueOf(body.get("rol")));
                    if (body.containsKey("activo")) usuario.setActivo(Boolean.valueOf(body.get("activo")));
                    if (body.containsKey("password") && !body.get("password").isEmpty()) {
                        usuario.setPassword(passwordEncoder.encode(body.get("password")));
                    }
                    Usuario saved = usuarioRepository.save(usuario);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setActivo(false);
                    usuarioRepository.save(usuario);
                    return ResponseEntity.ok(Map.of("message", "Usuario desactivado"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
