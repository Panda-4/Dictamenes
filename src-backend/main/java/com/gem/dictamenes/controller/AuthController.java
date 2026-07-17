package com.gem.dictamenes.controller;

import com.gem.dictamenes.dto.LoginRequest;
import com.gem.dictamenes.dto.LoginResponse;
import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.model.Usuario;
import com.gem.dictamenes.repository.AuditoriaRepository;
import com.gem.dictamenes.repository.UsuarioRepository;
import com.gem.dictamenes.security.JwtUtil;
import com.gem.dictamenes.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            Usuario usuario = (Usuario) authentication.getPrincipal();
            String token = jwtUtil.generateToken(usuario);

            // Registrar inicio de sesión en auditoría
            try {
                AuditoriaLog log = new AuditoriaLog();
                log.setUsuario(usuario.getUsername());
                log.setRol(usuario.getRol().name());
                log.setAccion("INICIO_SESIÓN");
                log.setEntidad("Autenticación");
                log.setDetalle("Inicio de sesión exitoso — Usuario: " + usuario.getUsername()
                        + " (" + usuario.getNombreCompleto() + ")");
                log.setFecha(LocalDateTime.now());
                log.setIp(RequestUtils.getClientIp(httpRequest));
                log.setDispositivo(RequestUtils.getDevice(httpRequest));
                auditoriaRepository.save(log);
            } catch (Exception e) {
                System.err.println("Error registrando log de inicio de sesión: " + e.getMessage());
            }

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    usuario.getUsername(),
                    usuario.getRol().name(),
                    usuario.getNombreCompleto()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Credenciales incorrectas"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "No autenticado"));
        }
        return ResponseEntity.ok(new LoginResponse(
                null,
                usuario.getUsername(),
                usuario.getRol().name(),
                usuario.getNombreCompleto()
        ));
    }
}
