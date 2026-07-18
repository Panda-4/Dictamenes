package com.gem.dictamenes.service;

import com.gem.dictamenes.model.Solicitud;
import com.gem.dictamenes.model.AuditoriaLog;
import java.util.List;

public interface SolicitudService {
    List<Solicitud> findAll();
    Solicitud findById(Long id);
    Solicitud save(Solicitud solicitud);
    void delete(Long id);
    List<AuditoriaLog> getHistorial(Long id);
}
