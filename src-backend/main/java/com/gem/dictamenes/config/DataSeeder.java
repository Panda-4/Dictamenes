package com.gem.dictamenes.config;

import com.gem.dictamenes.model.Rol;
import com.gem.dictamenes.model.Usuario;
import com.gem.dictamenes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = new Usuario();
            admin.setNombreCompleto("Admin DGRM");
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRol(Rol.ADMINISTRADOR);
            admin.setDependencia("Dirección General de Recursos Materiales");
            admin.setActivo(true);
            admin.setFechaCreacion(LocalDateTime.now());
            usuarioRepository.save(admin);
            System.out.println("✅ Usuario administrador creado: admin / admin123");
        }
    }
}
