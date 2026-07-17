package com.gem.dictamenes.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreCompleto;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private Rol rol;

    private String dependencia;

    private Boolean activo = true;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Usuario() {}

    public Usuario(Long id, String nombreCompleto, String username, String password, Rol rol, String dependencia, Boolean activo, LocalDateTime fechaCreacion) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.username = username;
        this.password = password;
        this.rol = rol;
        this.dependencia = dependencia;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public String getDependencia() { return dependencia; }
    public void setDependencia(String dependencia) { this.dependencia = dependencia; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    // --- Spring Security UserDetails ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.rol == null) return List.of();
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.rol.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.activo != null && this.activo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id) && Objects.equals(nombreCompleto, usuario.nombreCompleto) && Objects.equals(username, usuario.username) && Objects.equals(password, usuario.password) && rol == usuario.rol && Objects.equals(dependencia, usuario.dependencia) && Objects.equals(activo, usuario.activo) && Objects.equals(fechaCreacion, usuario.fechaCreacion);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nombreCompleto, username, password, rol, dependencia, activo, fechaCreacion);
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", username='" + username + '\'' +
                ", rol=" + rol +
                ", dependencia='" + dependencia + '\'' +
                ", activo=" + activo +
                ", fechaCreacion=" + fechaCreacion +
                '}';
    }
}
