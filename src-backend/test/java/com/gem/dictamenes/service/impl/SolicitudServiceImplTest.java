package com.gem.dictamenes.service.impl;

import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.model.Solicitud;
import com.gem.dictamenes.repository.AuditoriaRepository;
import com.gem.dictamenes.repository.NotificacionRepository;
import com.gem.dictamenes.repository.SolicitudRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
public class SolicitudServiceImplTest {

    @Mock
    private SolicitudRepository solicitudRepository;

    @Mock
    private AuditoriaRepository auditoriaRepository;

    @Mock
    private NotificacionRepository notificacionRepository;

    @InjectMocks
    private SolicitudServiceImpl solicitudService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock Security Context for Audit username/role capturing
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("test-user");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR"))).when(authentication).getAuthorities();

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    public void testSave_NewSolicitud_CreatesCreationAuditLog() {
        Solicitud solicitud = new Solicitud();
        solicitud.setTipoSolicitud("Dictamen Técnico");
        solicitud.setDependenciaOPD("OPD Test");
        solicitud.setMontoSolicitud(new BigDecimal("1500.00"));
        solicitud.setNumeroOficioSolicitud("OF-001");

        Solicitud savedSolicitud = new Solicitud();
        savedSolicitud.setFolioInterno(100L);
        savedSolicitud.setTipoSolicitud("Dictamen Técnico");
        savedSolicitud.setDependenciaOPD("OPD Test");
        savedSolicitud.setMontoSolicitud(new BigDecimal("1500.00"));
        savedSolicitud.setNumeroOficioSolicitud("OF-001");

        when(solicitudRepository.save(solicitud)).thenReturn(savedSolicitud);

        solicitudService.save(solicitud);

        ArgumentCaptor<AuditoriaLog> captor = ArgumentCaptor.forClass(AuditoriaLog.class);
        verify(auditoriaRepository).save(captor.capture());

        AuditoriaLog log = captor.getValue();
        assertEquals("CREACIÓN", log.getAccion());
        assertEquals("test-user", log.getUsuario());
        assertEquals("ADMINISTRADOR", log.getRol());
        assertEquals("Solicitud", log.getEntidad());
        assertNull(log.getCambiosDetalle());
        assertTrue(log.getDetalle().contains("Nueva solicitud creada"));
    }

    @Test
    public void testSave_ExistingSolicitud_CreatesUpdateAuditLogWithChanges() {
        Solicitud anterior = new Solicitud();
        anterior.setFolioInterno(100L);
        anterior.setTipoSolicitud("Dictamen Técnico");
        anterior.setMontoSolicitud(new BigDecimal("1500.00"));

        Solicitud nueva = new Solicitud();
        nueva.setFolioInterno(100L);
        nueva.setTipoSolicitud("Dictamen Técnico");
        nueva.setMontoSolicitud(new BigDecimal("2500.00")); // Monto modificado

        when(solicitudRepository.findById(100L)).thenReturn(Optional.of(anterior));
        when(solicitudRepository.save(nueva)).thenReturn(nueva);

        solicitudService.save(nueva);

        ArgumentCaptor<AuditoriaLog> captor = ArgumentCaptor.forClass(AuditoriaLog.class);
        verify(auditoriaRepository).save(captor.capture());

        AuditoriaLog log = captor.getValue();
        assertEquals("ACTUALIZACIÓN", log.getAccion());
        assertEquals("test-user", log.getUsuario());
        assertNotNull(log.getCambiosDetalle());
        assertTrue(log.getCambiosDetalle().contains("Monto de la Solicitud"));
    }
}
