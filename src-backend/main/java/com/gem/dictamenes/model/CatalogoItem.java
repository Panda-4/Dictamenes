package com.gem.dictamenes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "catalogos")
public class CatalogoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String tipo; // DEPENDENCIA, CAPITULO, UNIDAD_ADMINISTRATIVA, TIPO_EXCEPCION

    @Column(length = 50)
    private String codigo;

    @Column(nullable = false, length = 255)
    private String nombre;

    private Integer orden = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public CatalogoItem() {}

    public CatalogoItem(String tipo, String codigo, String nombre, Integer orden) {
        this.tipo = tipo;
        this.codigo = codigo;
        this.nombre = nombre;
        this.orden = orden != null ? orden : 0;
        this.activo = true;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
