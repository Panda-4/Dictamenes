package com.gem.dictamenes.config;

import com.gem.dictamenes.model.Rol;
import com.gem.dictamenes.model.Usuario;
import com.gem.dictamenes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    // Contraseña inicial del admin — leer de variable de entorno, nunca hardcodeada.
    @Value("${ADMIN_DEFAULT_PASSWORD:}")
    private String adminDefaultPassword;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.gem.dictamenes.repository.CatalogoRepository catalogoRepository;

    @Autowired
    private com.gem.dictamenes.service.RolPermisoService rolPermisoService;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByUsername("admin")) {
            String password = adminDefaultPassword;
            boolean generada = false;
            if (password == null || password.isBlank()) {
                // Generar contraseña segura aleatoria si no se configuró en el entorno
                password = generarPasswordSegura();
                generada = true;
            }
            Usuario admin = new Usuario();
            admin.setNombreCompleto("Admin DGRM");
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRol(Rol.ADMINISTRADOR);
            admin.setDependencia("Dirección General de Recursos Materiales");
            admin.setActivo(true);
            admin.setFechaCreacion(LocalDateTime.now());
            usuarioRepository.save(admin);
            if (generada) {
                System.out.println("✅ Usuario administrador creado: admin");
                System.out.println("⚠️  CONTRASEÑA GENERADA AUTOMÁTICAMENTE: " + password);
                System.out.println("⚠️  CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE DESDE EL PANEL DE ADMINISTRACIÓN.");
            } else {
                System.out.println("✅ Usuario administrador creado: admin (contraseña configurada desde variable de entorno).");
            }
        }

        // Sembrar catálogos si están vacíos
        seedCatalogos();

        // Inicializar permisos por rol
        rolPermisoService.inicializarPermisosPorDefecto();
        System.out.println("✅ Matriz de permisos por rol inicializada con éxito.");
    }

    private void seedCatalogos() {
        if (catalogoRepository.count() == 0) {
            // 1. Capítulos Presupuestales
            String[][] capitulos = {
                {"1000", "1000 - Servicios Personales"},
                {"2000", "2000 - Materiales y Suministros"},
                {"3000", "3000 - Servicios Generales"},
                {"4000", "4000 - Transferencias, Asignaciones, Subsidios y Otras Ayudas"},
                {"5000", "5000 - Bienes Muebles, Inmuebles e Intangibles"},
                {"6000", "6000 - Inversión Pública"}
            };
            int ord = 1;
            for (String[] cap : capitulos) {
                catalogoRepository.save(new com.gem.dictamenes.model.CatalogoItem("CAPITULO", cap[0], cap[1], ord++));
            }

            // 2. Dependencias y OPDs
            String[] dependencias = {
                "Poder Legislativo",
                "Unidad de Información",
                "Gubernatura",
                "Coordinación General de Comunicación Social",
                "Secretaría General de Gobierno",
                "Secretaría de Seguridad",
                "Secretaría de Finanzas",
                "Secretaría de Salud",
                "Secretaría del Trabajo",
                "Secretaría de Desarrollo Económico",
                "Secretaría de la Contraloría",
                "Secretaría de Movilidad",
                "Secretaría del Campo",
                "Secretaría de Cultura y Turismo",
                "Secretaría de las Mujeres",
                "Secretaría de Educación, Ciencia, Tecnología e Innovación",
                "Secretaría de Bienestar",
                "Secretaría de Desarrollo Urbano e Infraestructura",
                "Secretaría del Medio Ambiente y Desarrollo Sostenible",
                "Secretaría del Agua",
                "Consejería Jurídica",
                "Oficialía Mayor",
                "Jefatura de Gabinete y Proyectos Especiales",
                "Vocería de la Gubernatura",
                "Coordinación Técnica",
                "Agencia Digital del Estado de México",
                "Poder Judicial",
                "Instituto Electoral del Estado de México",
                "Comisión de Derechos Humanos del Estado de México",
                "Tribunal de Justicia Administrativa",
                "Junta Local de Conciliación y Arbitraje Valle de Toluca",
                "Tribunal Estatal de Conciliación y Arbitraje",
                "Universidad Autónoma del Estado de México",
                "Junta Local de Conciliación y Arbitraje del Valle Cuautitlán-Texcoco",
                "Tribunal Electoral del Estado de México",
                "Instituto de Transparencia, Acceso a la Información Pública y Protección de Datos Personales",
                "Fiscalía General de Justicia",
                "Secretaría Ejecutiva del Sistema Estatal Anticorrupción",
                "Otros"
            };
            ord = 1;
            for (String dep : dependencias) {
                catalogoRepository.save(new com.gem.dictamenes.model.CatalogoItem("DEPENDENCIA", null, dep, ord++));
            }

            // 3. Unidades Administrativas iniciales
            String[] unidades = {
                "Dirección General de Recursos Materiales",
                "Subdirección de Fianzas y Seguros",
                "Dirección de Adquisiciones",
                "Unidad Jurídica"
            };
            ord = 1;
            for (String uni : unidades) {
                catalogoRepository.save(new com.gem.dictamenes.model.CatalogoItem("UNIDAD_ADMINISTRATIVA", null, uni, ord++));
            }

            // 4. Tipos de Excepción iniciales
            String[] excepciones = {
                "Excepción por Urgencia o Emergencia",
                "Proveedor Único / Patente Exclusiva",
                "Seguridad Pública",
                "Dictaminación Técnica Especializada"
            };
            ord = 1;
            for (String exc : excepciones) {
                catalogoRepository.save(new com.gem.dictamenes.model.CatalogoItem("TIPO_EXCEPCION", null, exc, ord++));
            }

            System.out.println("✅ Catálogos maestros iniciales precargados con éxito.");
        }
    }

    /**
     * Genera una contraseña segura aleatoria de 16 caracteres.
     * Se muestra en el log solo en el primer arranque, para que el administrador
     * pueda acceder y cambiarla de inmediato desde el panel de usuarios.
     */
    private String generarPasswordSegura() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
