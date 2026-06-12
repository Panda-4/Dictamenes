package com.gem.dictamenes.service.impl;

import com.gem.dictamenes.model.Solicitud;
import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.model.Notificacion;
import com.gem.dictamenes.repository.SolicitudRepository;
import com.gem.dictamenes.repository.AuditoriaRepository;
import com.gem.dictamenes.repository.NotificacionRepository;
import com.gem.dictamenes.service.SolicitudService;
import com.gem.dictamenes.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final NotificacionRepository notificacionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public SolicitudServiceImpl(SolicitudRepository solicitudRepository, 
                                AuditoriaRepository auditoriaRepository, 
                                NotificacionRepository notificacionRepository) {
        this.solicitudRepository = solicitudRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.notificacionRepository = notificacionRepository;
    }

    @Override
    public List<Solicitud> findAll() {
        return solicitudRepository.findAll();
    }

    @Override
    public Solicitud findById(Long id) {
        return solicitudRepository.findById(id).orElse(null);
    }

    @Override
    public Solicitud save(Solicitud solicitud) {
        // Aplicar valores por defecto para evitar fallos por constraints NOT NULL en la base de datos
        if (solicitud.getNumeroOficioSolicitud() == null || solicitud.getNumeroOficioSolicitud().trim().isEmpty()) {
            solicitud.setNumeroOficioSolicitud("S/N");
        }
        if (solicitud.getDependenciaOPD() == null || solicitud.getDependenciaOPD().trim().isEmpty()) {
            solicitud.setDependenciaOPD("No especificada");
        }
        if (solicitud.getUnidadAdministrativa() == null || solicitud.getUnidadAdministrativa().trim().isEmpty()) {
            solicitud.setUnidadAdministrativa("No especificada");
        }
        if (solicitud.getPartidaPresupuestal() == null || solicitud.getPartidaPresupuestal().trim().isEmpty()) {
            solicitud.setPartidaPresupuestal("N/A");
        }
        if (solicitud.getMontoSolicitud() == null) {
            solicitud.setMontoSolicitud(java.math.BigDecimal.ZERO);
        }
        if (solicitud.getExcepcionDGRMOM() == null) {
            solicitud.setExcepcionDGRMOM(false);
        }
        if (solicitud.getExcepcionDictaminacion() == null) {
            solicitud.setExcepcionDictaminacion(false);
        }
        
        normalizarCampos(solicitud);

        boolean isNew = solicitud.getFolioInterno() == null;
        String cambiosJson = null;
        String detalle;

        if (!isNew) {
            // Fetch the previous version before saving to detect changes
            Solicitud anterior = solicitudRepository.findById(solicitud.getFolioInterno()).orElse(null);
            cambiosJson = detectarCambios(anterior, solicitud);
        }

        Solicitud saved = solicitudRepository.save(solicitud);

        if (isNew) {
            detalle = "Nueva solicitud creada — Folio: " + saved.getFolioInterno()
                    + " — Tipo: " + saved.getTipoSolicitud()
                    + ", Dependencia: " + saved.getDependenciaOPD()
                    + ", Monto: $" + saved.getMontoSolicitud()
                    + ", Oficio: " + saved.getNumeroOficioSolicitud();
        } else {
            detalle = "Solicitud actualizada — Folio: " + saved.getFolioInterno();
        }

        String accion = isNew ? "CREACIÓN" : "ACTUALIZACIÓN";
        registrarAuditoria(accion, detalle, cambiosJson);
        
        if (isNew) {
            generarNotificacionesNuevaSolicitud(saved);
        }
        
        return saved;
    }

    private void normalizarCampos(Solicitud solicitud) {
        if (solicitud.getTipoSolicitud() != null) {
            String ts = solicitud.getTipoSolicitud().trim().toLowerCase();
            if (ts.contains("procedencia")) {
                solicitud.setTipoSolicitud("Dictamen de Procedencia");
            } else if (ts.contains("opinión") || ts.contains("opinion") || ts.equals("opinión técnica") || ts.equals("opinión técnica previa")) {
                solicitud.setTipoSolicitud("Opinión Técnica Previa");
            } else if (ts.contains("previo")) {
                solicitud.setTipoSolicitud("Dictamen Previo");
            } else if (ts.contains("austeridad") || ts.contains("excepción") || ts.contains("excepcion")) {
                solicitud.setTipoSolicitud("Excepción a Medidas de Austeridad");
            } else if (ts.contains("técnico") || ts.contains("tecnico") || ts.contains("dictamen")) {
                solicitud.setTipoSolicitud("Dictamen Técnico");
            } else {
                solicitud.setTipoSolicitud("Dictamen Técnico");
            }
        } else {
            solicitud.setTipoSolicitud("Dictamen Técnico");
        }

        if (solicitud.getEstatusGeneral() != null) {
            String eg = solicitud.getEstatusGeneral().trim().toLowerCase();
            if (eg.contains("concluid") || eg.contains("entregado a dependencia")) {
                solicitud.setEstatusGeneral("Concluido Entregado a dependencia solicitante");
            } else if (eg.contains("elaboraci") || eg.contains("proceso")) {
                solicitud.setEstatusGeneral("En proceso de elaboración");
            } else if (eg.contains("firma")) {
                solicitud.setEstatusGeneral("En Firma de Dirección General");
            } else if (eg.contains("autorizaci") || eg.contains("om")) {
                solicitud.setEstatusGeneral("En autorización de la OM");
            } else if (eg.contains("opinión") || eg.contains("opinion") || eg.contains("análisis") || eg.contains("analisis")) {
                solicitud.setEstatusGeneral("En Opinión Técnica de Subdirección de Fianzas y Seguros");
            } else {
                solicitud.setEstatusGeneral("En Opinión Técnica de Subdirección de Fianzas y Seguros");
            }
        } else {
            solicitud.setEstatusGeneral("En Opinión Técnica de Subdirección de Fianzas y Seguros");
        }
    }

    /**
     * Compares two Solicitud objects field by field and returns a JSON string
     * with an array of changes: [{campo, antes, despues}, ...]
     */
    private String detectarCambios(Solicitud anterior, Solicitud nueva) {
        if (anterior == null) return null;

        List<Map<String, String>> cambios = new ArrayList<>();

        compararCampo(cambios, "Tipo de Solicitud", anterior.getTipoSolicitud(), nueva.getTipoSolicitud());
        compararCampo(cambios, "Número de Oficio", anterior.getNumeroOficioSolicitud(), nueva.getNumeroOficioSolicitud());
        compararCampo(cambios, "Dependencia / OPD", anterior.getDependenciaOPD(), nueva.getDependenciaOPD());
        compararCampo(cambios, "Unidad Administrativa", anterior.getUnidadAdministrativa(), nueva.getUnidadAdministrativa());
        compararCampo(cambios, "Centro de Costos", anterior.getCentroCostos(), nueva.getCentroCostos());
        compararCampo(cambios, "Capítulo", anterior.getCapitulo(), nueva.getCapitulo());
        compararCampo(cambios, "Partida Presupuestal", anterior.getPartidaPresupuestal(), nueva.getPartidaPresupuestal());
        compararCampo(cambios, "Giro", anterior.getGiro(), nueva.getGiro());
        compararCampo(cambios, "Monto de la Solicitud", toStr(anterior.getMontoSolicitud()), toStr(nueva.getMontoSolicitud()));
        compararCampo(cambios, "Estatus General", anterior.getEstatusGeneral(), nueva.getEstatusGeneral());
        compararCampo(cambios, "Descripción de Solicitud", anterior.getDescripcionSolicitud(), nueva.getDescripcionSolicitud());
        compararCampo(cambios, "Procedente", toStr(anterior.getProcedente()), toStr(nueva.getProcedente()));
        compararCampo(cambios, "Fecha Recepción DGRM/OM", toStr(anterior.getFechaRecepcionDGRMOM()), toStr(nueva.getFechaRecepcionDGRMOM()));
        compararCampo(cambios, "Excepción DGRM/OM", toStr(anterior.getExcepcionDGRMOM()), toStr(nueva.getExcepcionDGRMOM()));
        compararCampo(cambios, "Fecha Recepción Dictaminación", toStr(anterior.getFechaRecepcionDictaminacion()), toStr(nueva.getFechaRecepcionDictaminacion()));
        compararCampo(cambios, "Excepción Dictaminación", toStr(anterior.getExcepcionDictaminacion()), toStr(nueva.getExcepcionDictaminacion()));
        compararCampo(cambios, "Fecha Envío Autorización OM", toStr(anterior.getFechaEnvioAutorizacionOM()), toStr(nueva.getFechaEnvioAutorizacionOM()));
        compararCampo(cambios, "Fecha Emisión Autorización", toStr(anterior.getFechaEmisionAutorizacion()), toStr(nueva.getFechaEmisionAutorizacion()));
        compararCampo(cambios, "Fecha Envío Firma DG", toStr(anterior.getFechaEnvioFirmaDG()), toStr(nueva.getFechaEnvioFirmaDG()));
        compararCampo(cambios, "Fecha Envío Dependencia", toStr(anterior.getFechaEnvioDependencia()), toStr(nueva.getFechaEnvioDependencia()));
        compararCampo(cambios, "Fecha Envío Respuesta Firma DG", toStr(anterior.getFechaEnvioRespuestaFirmaDG()), toStr(nueva.getFechaEnvioRespuestaFirmaDG()));
        compararCampo(cambios, "Fecha Envío Respuesta Dependencia", toStr(anterior.getFechaEnvioRespuestaDependencia()), toStr(nueva.getFechaEnvioRespuestaDependencia()));
        compararCampo(cambios, "Cuenta Dictamen Previo", anterior.getCuentaDictamenPrevio(), nueva.getCuentaDictamenPrevio());
        compararCampo(cambios, "Fecha Emisión Dictamen Previo", toStr(anterior.getFechaEmisionDictamenPrevio()), toStr(nueva.getFechaEmisionDictamenPrevio()));
        compararCampo(cambios, "Nro. Oficio Dictamen Previo", anterior.getNumeroOficioDictamenPrevio(), nueva.getNumeroOficioDictamenPrevio());
        compararCampo(cambios, "Cuenta Excepción Austeridad", anterior.getCuentaExcepcionAusteridad(), nueva.getCuentaExcepcionAusteridad());
        compararCampo(cambios, "Fecha Emisión Excepción", toStr(anterior.getFechaEmisionExcepcion()), toStr(nueva.getFechaEmisionExcepcion()));
        compararCampo(cambios, "Monto Estudio de Mercado", toStr(anterior.getMontoEstudioMercado()), toStr(nueva.getMontoEstudioMercado()));
        compararCampo(cambios, "Cuenta Autorización OM", toStr(anterior.getCuentaAutorizacionOM()), toStr(nueva.getCuentaAutorizacionOM()));
        compararCampo(cambios, "Nro. Oficio Autorización", anterior.getNumeroOficioAutorizacion(), nueva.getNumeroOficioAutorizacion());
        compararCampo(cambios, "Fecha Respuesta OM→DGRM", toStr(anterior.getFechaEnvioRespuestaOM_DGRM()), toStr(nueva.getFechaEnvioRespuestaOM_DGRM()));
        compararCampo(cambios, "Fecha Recepción DGRM", toStr(anterior.getFechaRecepcionDGRM()), toStr(nueva.getFechaRecepcionDGRM()));
        compararCampo(cambios, "Fecha Respuesta DGRM→Dep.", toStr(anterior.getFechaRespuestaDGRM_Dependencia()), toStr(nueva.getFechaRespuestaDGRM_Dependencia()));
        compararCampo(cambios, "Nro. Oficio Respuesta", anterior.getNumeroOficioRespuesta(), nueva.getNumeroOficioRespuesta());
        compararCampo(cambios, "Tipo de Excepción", anterior.getTipoExcepcion(), nueva.getTipoExcepcion());
        compararCampo(cambios, "Descripción Excepción", anterior.getDescripcionExcepcion(), nueva.getDescripcionExcepcion());
        compararCampo(cambios, "Monto Suficiencia Presupuestal", toStr(anterior.getMontoSuficienciaPresupuestal()), toStr(nueva.getMontoSuficienciaPresupuestal()));
        compararCampo(cambios, "Fecha Respuesta Excepción", toStr(anterior.getFechaRespuestaExcepcion()), toStr(nueva.getFechaRespuestaExcepcion()));

        if (cambios.isEmpty()) return null;

        try {
            return objectMapper.writeValueAsString(cambios);
        } catch (Exception e) {
            System.err.println("Error serializando cambios: " + e.getMessage());
            return null;
        }
    }

    private void compararCampo(List<Map<String, String>> cambios, String etiqueta, String antes, String despues) {
        // Normalize nulls and empty strings for comparison
        String a = (antes == null || antes.trim().isEmpty()) ? null : antes.trim();
        String d = (despues == null || despues.trim().isEmpty()) ? null : despues.trim();

        if (!Objects.equals(a, d)) {
            Map<String, String> cambio = new LinkedHashMap<>();
            cambio.put("campo", etiqueta);
            cambio.put("antes", a != null ? a : "—");
            cambio.put("despues", d != null ? d : "—");
            cambios.add(cambio);
        }
    }

    private String toStr(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean) return ((Boolean) value) ? "Sí" : "No";
        return value.toString();
    }

    private void generarNotificacionesNuevaSolicitud(Solicitud solicitud) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String creador = auth != null ? auth.getName() : "SISTEMA";
            String msj = "Nueva solicitud #" + solicitud.getFolioInterno() + " (" + solicitud.getTipoSolicitud() + ") registrada por " + creador;
            
            Notificacion notifAdmin = new Notificacion();
            notifAdmin.setMensaje(msj);
            notifAdmin.setFecha(LocalDateTime.now());
            notifAdmin.setDestinatarioRol("ADMINISTRADOR");
            notifAdmin.setSolicitudId(solicitud.getFolioInterno());
            notifAdmin.setCreadoPor(creador);
            notifAdmin.setLeida(false);
            
            Notificacion notifAuth = new Notificacion();
            notifAuth.setMensaje(msj);
            notifAuth.setFecha(LocalDateTime.now());
            notifAuth.setDestinatarioRol("AUTORIZADOR");
            notifAuth.setSolicitudId(solicitud.getFolioInterno());
            notifAuth.setCreadoPor(creador);
            notifAuth.setLeida(false);
            
            notificacionRepository.saveAll(List.of(notifAdmin, notifAuth));
        } catch (Exception e) {
            System.err.println("Error generando notificaciones: " + e.getMessage());
        }
    }

    @Override
    public void delete(Long id) {
        if (id == null) return;
        // Capture record details before deletion for audit trail
        Solicitud solicitud = solicitudRepository.findById(id).orElse(null);
        String detalle;
        if (solicitud != null) {
            detalle = "Registro eliminado — Folio: " + id
                    + ", Tipo: " + solicitud.getTipoSolicitud()
                    + ", Dependencia: " + solicitud.getDependenciaOPD()
                    + ", Monto: $" + solicitud.getMontoSolicitud()
                    + ", Oficio: " + solicitud.getNumeroOficioSolicitud();
        } else {
            detalle = "Folio Interno: " + id;
        }
        solicitudRepository.deleteById(id);
        registrarAuditoria("ELIMINACIÓN", detalle, null);
    }
    
    private void registrarAuditoria(String accion, String detalles, String cambiosDetalle) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) return;

            String usuario = auth.getName();
            String rol = auth.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("DESCONOCIDO");

            AuditoriaLog log = new AuditoriaLog();
            log.setUsuario(usuario);
            log.setRol(rol);
            log.setAccion(accion);
            log.setDetalle(detalles);
            log.setCambiosDetalle(cambiosDetalle);
            log.setFecha(LocalDateTime.now());
            log.setEntidad("Solicitud");

            // Obtener IP y dispositivo desde el contexto de la solicitud HTTP
            HttpServletRequest request = RequestUtils.getCurrentRequest();
            if (request != null) {
                log.setIp(RequestUtils.getClientIp(request));
                log.setDispositivo(RequestUtils.getDevice(request));
            } else {
                log.setIp("127.0.0.1");
                log.setDispositivo("Sistema / Interno");
            }

            auditoriaRepository.save(log);
        } catch (Exception e) {
            System.err.println("Error guardando log de auditoría: " + e.getMessage());
        }
    }

    @Override
    public List<AuditoriaLog> getHistorial(Long id) {
        Solicitud solicitud = solicitudRepository.findById(id).orElse(null);
        String oficio = solicitud != null ? solicitud.getNumeroOficioSolicitud() : "";
        return auditoriaRepository.findBySolicitudIdAndOficio(id, oficio);
    }

    @Override
    public com.gem.dictamenes.dto.ExcelImportDto previewImport(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        try (java.io.InputStream is = file.getInputStream()) {
            return com.gem.dictamenes.util.ExcelHelper.parseExcel(is, solicitudRepository);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void confirmImport(List<Solicitud> solicitudes) {
        if (solicitudes == null) return;
        for (Solicitud s : solicitudes) {
            save(s);
        }
        registrarAuditoria("IMPORTACIÓN_EXCEL", "Carga masiva realizada. Registros importados/actualizados: " + solicitudes.size(), null);
    }
}
