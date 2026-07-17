package com.gem.dictamenes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mensaje;

    private LocalDateTime fecha;

    /** Rol al que va dirigida: ADMINISTRADOR, AUTORIZADOR */
    private String destinatarioRol;

    /** Folio de la solicitud relacionada (para navegación) */
    private Long solicitudId;

    /** Quién generó la acción */
    private String creadoPor;

    private Boolean leida = false;

    public Notificacion() {}

    public Notificacion(Long id, String mensaje, LocalDateTime fecha, String destinatarioRol, Long solicitudId, String creadoPor, Boolean leida) {
        this.id = id;
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.destinatarioRol = destinatarioRol;
        this.solicitudId = solicitudId;
        this.creadoPor = creadoPor;
        this.leida = leida;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public String getDestinatarioRol() { return destinatarioRol; }
    public void setDestinatarioRol(String destinatarioRol) { this.destinatarioRol = destinatarioRol; }

    public Long getSolicitudId() { return solicitudId; }
    public void setSolicitudId(Long solicitudId) { this.solicitudId = solicitudId; }

    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }

    public Boolean getLeida() { return leida; }
    public void setLeida(Boolean leida) { this.leida = leida; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Notificacion that = (Notificacion) o;
        return Objects.equals(id, that.id) && Objects.equals(mensaje, that.mensaje) && Objects.equals(fecha, that.fecha) && Objects.equals(destinatarioRol, that.destinatarioRol) && Objects.equals(solicitudId, that.solicitudId) && Objects.equals(creadoPor, that.creadoPor) && Objects.equals(leida, that.leida);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, mensaje, fecha, destinatarioRol, solicitudId, creadoPor, leida);
    }

    @Override
    public String toString() {
        return "Notificacion{" +
                "id=" + id +
                ", mensaje='" + mensaje + '\'' +
                ", fecha=" + fecha +
                ", destinatarioRol='" + destinatarioRol + '\'' +
                ", solicitudId=" + solicitudId +
                ", creadoPor='" + creadoPor + '\'' +
                ", leida=" + leida +
                '}';
    }
}
