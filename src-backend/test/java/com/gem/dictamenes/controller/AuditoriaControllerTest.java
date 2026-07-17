package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.repository.AuditoriaRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
public class AuditoriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditoriaRepository auditoriaRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMINISTRADOR"})
    public void testGetAuditoria_Admin_Success() throws Exception {
        Pageable pageable = PageRequest.of(0, 20, Sort.by("id").descending());
        Mockito.when(auditoriaRepository.findByFilters(null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(new AuditoriaLog())));

        mockMvc.perform(get("/api/auditoria")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "capturista", roles = {"CAPTURISTA"})
    public void testGetAuditoria_Capturista_Forbidden() throws Exception {
        mockMvc.perform(get("/api/auditoria"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetAuditoria_Anonymous_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/auditoria"))
                .andExpect(status().isUnauthorized());
    }
}
