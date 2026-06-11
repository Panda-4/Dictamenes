package com.gem.dictamenes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "solicitudes")
public class Solicitud {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long folioInterno;
    
    private String numeroOficioSolicitud;
    private LocalDate fechaRecepcionDGRMOM;
    private Boolean excepcionDGRMOM;
    
    private LocalDate fechaRecepcionDictaminacion;
    private Boolean excepcionDictaminacion;
    
    private String dependenciaOPD;
    private String unidadAdministrativa;
    private String centroCostos;
    private String capitulo;
    private String partidaPresupuestal;
    private String giro;
    
    private BigDecimal montoSolicitud;
    private String tipoSolicitud;
    private String estatusGeneral;

    @Column(columnDefinition = "TEXT")
    private String descripcionSolicitud;
    private Boolean procedente;
    
    private LocalDate fechaEnvioAutorizacionOM;
    private LocalDate fechaEmisionAutorizacion;
    private LocalDate fechaEnvioFirmaDG;
    private LocalDate fechaEnvioDependencia;
    
    private LocalDate fechaEnvioRespuestaFirmaDG;
    private LocalDate fechaEnvioRespuestaDependencia;
    
    private String cuentaDictamenPrevio; 
    private LocalDate fechaEmisionDictamenPrevio;
    private String numeroOficioDictamenPrevio;
    
    private String cuentaExcepcionAusteridad; 
    private LocalDate fechaEmisionExcepcion;
    
    private BigDecimal montoEstudioMercado;
    private Boolean cuentaAutorizacionOM;
    private String numeroOficioAutorizacion;
    private LocalDate fechaEnvioRespuestaOM_DGRM;
    private LocalDate fechaRecepcionDGRM;
    private LocalDate fechaRespuestaDGRM_Dependencia;
    
    private String numeroOficioRespuesta;
    
    private String tipoExcepcion;
    @Column(columnDefinition = "TEXT")
    private String descripcionExcepcion;
    private BigDecimal montoSuficienciaPresupuestal;
    private LocalDate fechaRespuestaExcepcion;

    public Solicitud() {}

    // Getters and Setters
    public Long getFolioInterno() { return folioInterno; }
    public void setFolioInterno(Long folioInterno) { this.folioInterno = folioInterno; }

    public String getNumeroOficioSolicitud() { return numeroOficioSolicitud; }
    public void setNumeroOficioSolicitud(String numeroOficioSolicitud) { this.numeroOficioSolicitud = numeroOficioSolicitud; }

    public LocalDate getFechaRecepcionDGRMOM() { return fechaRecepcionDGRMOM; }
    public void setFechaRecepcionDGRMOM(LocalDate fechaRecepcionDGRMOM) { this.fechaRecepcionDGRMOM = fechaRecepcionDGRMOM; }

    public Boolean getExcepcionDGRMOM() { return excepcionDGRMOM; }
    public void setExcepcionDGRMOM(Boolean excepcionDGRMOM) { this.excepcionDGRMOM = excepcionDGRMOM; }

    public LocalDate getFechaRecepcionDictaminacion() { return fechaRecepcionDictaminacion; }
    public void setFechaRecepcionDictaminacion(LocalDate fechaRecepcionDictaminacion) { this.fechaRecepcionDictaminacion = fechaRecepcionDictaminacion; }

    public Boolean getExcepcionDictaminacion() { return excepcionDictaminacion; }
    public void setExcepcionDictaminacion(Boolean excepcionDictaminacion) { this.excepcionDictaminacion = excepcionDictaminacion; }

    public String getDependenciaOPD() { return dependenciaOPD; }
    public void setDependenciaOPD(String dependenciaOPD) { this.dependenciaOPD = dependenciaOPD; }

    public String getUnidadAdministrativa() { return unidadAdministrativa; }
    public void setUnidadAdministrativa(String unidadAdministrativa) { this.unidadAdministrativa = unidadAdministrativa; }

    public String getCentroCostos() { return centroCostos; }
    public void setCentroCostos(String centroCostos) { this.centroCostos = centroCostos; }

    public String getCapitulo() { return capitulo; }
    public void setCapitulo(String capitulo) { this.capitulo = capitulo; }

    public String getPartidaPresupuestal() { return partidaPresupuestal; }
    public void setPartidaPresupuestal(String partidaPresupuestal) { this.partidaPresupuestal = partidaPresupuestal; }

    public String getGiro() { return giro; }
    public void setGiro(String giro) { this.giro = giro; }

    public BigDecimal getMontoSolicitud() { return montoSolicitud; }
    public void setMontoSolicitud(BigDecimal montoSolicitud) { this.montoSolicitud = montoSolicitud; }

    public String getTipoSolicitud() { return tipoSolicitud; }
    public void setTipoSolicitud(String tipoSolicitud) { this.tipoSolicitud = tipoSolicitud; }

    public String getEstatusGeneral() { return estatusGeneral; }
    public void setEstatusGeneral(String estatusGeneral) { this.estatusGeneral = estatusGeneral; }

    public String getDescripcionSolicitud() { return descripcionSolicitud; }
    public void setDescripcionSolicitud(String descripcionSolicitud) { this.descripcionSolicitud = descripcionSolicitud; }

    public Boolean getProcedente() { return procedente; }
    public void setProcedente(Boolean procedente) { this.procedente = procedente; }

    public LocalDate getFechaEnvioAutorizacionOM() { return fechaEnvioAutorizacionOM; }
    public void setFechaEnvioAutorizacionOM(LocalDate fechaEnvioAutorizacionOM) { this.fechaEnvioAutorizacionOM = fechaEnvioAutorizacionOM; }

    public LocalDate getFechaEmisionAutorizacion() { return fechaEmisionAutorizacion; }
    public void setFechaEmisionAutorizacion(LocalDate fechaEmisionAutorizacion) { this.fechaEmisionAutorizacion = fechaEmisionAutorizacion; }

    public LocalDate getFechaEnvioFirmaDG() { return fechaEnvioFirmaDG; }
    public void setFechaEnvioFirmaDG(LocalDate fechaEnvioFirmaDG) { this.fechaEnvioFirmaDG = fechaEnvioFirmaDG; }

    public LocalDate getFechaEnvioDependencia() { return fechaEnvioDependencia; }
    public void setFechaEnvioDependencia(LocalDate fechaEnvioDependencia) { this.fechaEnvioDependencia = fechaEnvioDependencia; }

    public LocalDate getFechaEnvioRespuestaFirmaDG() { return fechaEnvioRespuestaFirmaDG; }
    public void setFechaEnvioRespuestaFirmaDG(LocalDate fechaEnvioRespuestaFirmaDG) { this.fechaEnvioRespuestaFirmaDG = fechaEnvioRespuestaFirmaDG; }

    public LocalDate getFechaEnvioRespuestaDependencia() { return fechaEnvioRespuestaDependencia; }
    public void setFechaEnvioRespuestaDependencia(LocalDate fechaEnvioRespuestaDependencia) { this.fechaEnvioRespuestaDependencia = fechaEnvioRespuestaDependencia; }

    public String getCuentaDictamenPrevio() { return cuentaDictamenPrevio; }
    public void setCuentaDictamenPrevio(String cuentaDictamenPrevio) { this.cuentaDictamenPrevio = cuentaDictamenPrevio; }

    public LocalDate getFechaEmisionDictamenPrevio() { return fechaEmisionDictamenPrevio; }
    public void setFechaEmisionDictamenPrevio(LocalDate fechaEmisionDictamenPrevio) { this.fechaEmisionDictamenPrevio = fechaEmisionDictamenPrevio; }

    public String getNumeroOficioDictamenPrevio() { return numeroOficioDictamenPrevio; }
    public void setNumeroOficioDictamenPrevio(String numeroOficioDictamenPrevio) { this.numeroOficioDictamenPrevio = numeroOficioDictamenPrevio; }

    public String getCuentaExcepcionAusteridad() { return cuentaExcepcionAusteridad; }
    public void setCuentaExcepcionAusteridad(String cuentaExcepcionAusteridad) { this.cuentaExcepcionAusteridad = cuentaExcepcionAusteridad; }

    public LocalDate getFechaEmisionExcepcion() { return fechaEmisionExcepcion; }
    public void setFechaEmisionExcepcion(LocalDate fechaEmisionExcepcion) { this.fechaEmisionExcepcion = fechaEmisionExcepcion; }

    public BigDecimal getMontoEstudioMercado() { return montoEstudioMercado; }
    public void setMontoEstudioMercado(BigDecimal montoEstudioMercado) { this.montoEstudioMercado = montoEstudioMercado; }

    public Boolean getCuentaAutorizacionOM() { return cuentaAutorizacionOM; }
    public void setCuentaAutorizacionOM(Boolean cuentaAutorizacionOM) { this.cuentaAutorizacionOM = cuentaAutorizacionOM; }

    public String getNumeroOficioAutorizacion() { return numeroOficioAutorizacion; }
    public void setNumeroOficioAutorizacion(String numeroOficioAutorizacion) { this.numeroOficioAutorizacion = numeroOficioAutorizacion; }

    public LocalDate getFechaEnvioRespuestaOM_DGRM() { return fechaEnvioRespuestaOM_DGRM; }
    public void setFechaEnvioRespuestaOM_DGRM(LocalDate fechaEnvioRespuestaOM_DGRM) { this.fechaEnvioRespuestaOM_DGRM = fechaEnvioRespuestaOM_DGRM; }

    public LocalDate getFechaRecepcionDGRM() { return fechaRecepcionDGRM; }
    public void setFechaRecepcionDGRM(LocalDate fechaRecepcionDGRM) { this.fechaRecepcionDGRM = fechaRecepcionDGRM; }

    public LocalDate getFechaRespuestaDGRM_Dependencia() { return fechaRespuestaDGRM_Dependencia; }
    public void setFechaRespuestaDGRM_Dependencia(LocalDate fechaRespuestaDGRM_Dependencia) { this.fechaRespuestaDGRM_Dependencia = fechaRespuestaDGRM_Dependencia; }

    public String getNumeroOficioRespuesta() { return numeroOficioRespuesta; }
    public void setNumeroOficioRespuesta(String numeroOficioRespuesta) { this.numeroOficioRespuesta = numeroOficioRespuesta; }

    public String getTipoExcepcion() { return tipoExcepcion; }
    public void setTipoExcepcion(String tipoExcepcion) { this.tipoExcepcion = tipoExcepcion; }

    public String getDescripcionExcepcion() { return descripcionExcepcion; }
    public void setDescripcionExcepcion(String descripcionExcepcion) { this.descripcionExcepcion = descripcionExcepcion; }

    public BigDecimal getMontoSuficienciaPresupuestal() { return montoSuficienciaPresupuestal; }
    public void setMontoSuficienciaPresupuestal(BigDecimal montoSuficienciaPresupuestal) { this.montoSuficienciaPresupuestal = montoSuficienciaPresupuestal; }

    public LocalDate getFechaRespuestaExcepcion() { return fechaRespuestaExcepcion; }
    public void setFechaRespuestaExcepcion(LocalDate fechaRespuestaExcepcion) { this.fechaRespuestaExcepcion = fechaRespuestaExcepcion; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Solicitud solicitud = (Solicitud) o;
        return Objects.equals(folioInterno, solicitud.folioInterno);
    }

    @Override
    public int hashCode() {
        return Objects.hash(folioInterno);
    }
}
