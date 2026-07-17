package com.gem.dictamenes.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Migración para asegurar que la columna 'rol' de la tabla 'usuarios' sea VARCHAR(50)
 * en lugar de un tipo ENUM nativo de MySQL, lo que permite agregar nuevos roles al enum
 * de Java sin necesidad de ALTER TABLE manual.
 */
@Component
@Order(0) // Ejecutar antes del DataSeeder
public class RolColumnMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE usuarios MODIFY COLUMN rol VARCHAR(50) NOT NULL"
            );
            System.out.println("✅ Columna 'rol' migrada a VARCHAR(50) exitosamente.");
        } catch (Exception e) {
            // Si ya es VARCHAR o la tabla no existe aún, ignorar silenciosamente
            System.out.println("ℹ️ Migración de columna 'rol': " + e.getMessage());
        }
    }
}
