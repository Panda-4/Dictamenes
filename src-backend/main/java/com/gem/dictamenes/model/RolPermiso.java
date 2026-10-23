package com.gem.dictamenes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles_permisos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"rol", "permiso"})
})
public class RolPermiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String rol; // ADMINISTRADOR, AUTORIZADOR, CAPTURISTA, CONSULTA

    @Column(nullable = false, length = 50)
    private String permiso; // SOLICITUDES_CREAR, SOLICITUDES_EDITAR, etc.

    @Column(nullable = false)
    private Boolean habilitado = true;

    public RolPermiso() {}

    public RolPermiso(String rol, String permiso, Boolean habilitado) {
        this.rol = rol;
        this.permiso = permiso;
        this.habilitado = habilitado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getPermiso() { return permiso; }
    public void setPermiso(String permiso) { this.permiso = permiso; }

    public Boolean getHabilitado() { return habilitado; }
    public void setHabilitado(Boolean habilitado) { this.habilitado = habilitado; }
}
