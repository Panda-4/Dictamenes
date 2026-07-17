package com.gem.dictamenes.controller;

import com.gem.dictamenes.model.AuditoriaLog;
import com.gem.dictamenes.repository.AuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaRepository repository;

    @Autowired
    public AuditoriaController(AuditoriaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<AuditoriaLog> getAll() {
        return repository.findAll();
    }
}
