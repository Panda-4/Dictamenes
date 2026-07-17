package com.gem.dictamenes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "auditoria_logs")
public class AuditoriaLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;
    private String rol;
    private String usuario;
    private String accion;
    private String entidad;
    private String detalle;

    @Column(columnDefinition = "TEXT")
    private String cambiosDetalle;

    private String ip;
    private String dispositivo;

    public AuditoriaLog() {}

    public AuditoriaLog(Long id, LocalDateTime fecha, String rol, String usuario, String accion, String entidad, String detalle, String cambiosDetalle, String ip, String dispositivo) {
        this.id = id;
        this.fecha = fecha;
        this.rol = rol;
        this.usuario = usuario;
        this.accion = accion;
        this.entidad = entidad;
        this.detalle = detalle;
        this.cambiosDetalle = cambiosDetalle;
        this.ip = ip;
        this.dispositivo = dispositivo;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getEntidad() { return entidad; }
    public void setEntidad(String entidad) { this.entidad = entidad; }

    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }

    public String getCambiosDetalle() { return cambiosDetalle; }
    public void setCambiosDetalle(String cambiosDetalle) { this.cambiosDetalle = cambiosDetalle; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getDispositivo() { return dispositivo; }
    public void setDispositivo(String dispositivo) { this.dispositivo = dispositivo; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuditoriaLog that = (AuditoriaLog) o;
        return Objects.equals(id, that.id) && Objects.equals(fecha, that.fecha) && Objects.equals(rol, that.rol) && Objects.equals(usuario, that.usuario) && Objects.equals(accion, that.accion) && Objects.equals(entidad, that.entidad) && Objects.equals(detalle, that.detalle) && Objects.equals(cambiosDetalle, that.cambiosDetalle);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, fecha, rol, usuario, accion, entidad, detalle, cambiosDetalle);
    }

    @Override
    public String toString() {
        return "AuditoriaLog{" +
                "id=" + id +
                ", fecha=" + fecha +
                ", rol='" + rol + '\'' +
                ", usuario='" + usuario + '\'' +
                ", accion='" + accion + '\'' +
                ", entidad='" + entidad + '\'' +
                ", detalle='" + detalle + '\'' +
                ", cambiosDetalle='" + cambiosDetalle + '\'' +
                '}';
    }
}
