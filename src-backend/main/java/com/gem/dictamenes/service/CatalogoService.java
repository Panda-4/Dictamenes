package com.gem.dictamenes.service;

import com.gem.dictamenes.model.CatalogoItem;
import com.gem.dictamenes.repository.CatalogoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CatalogoService {

    @Autowired
    private CatalogoRepository catalogoRepository;

    public List<CatalogoItem> listarActivosPorTipo(String tipo) {
        return catalogoRepository.findByTipoAndActivoTrueOrderByOrdenAscNombreAsc(tipo);
    }

    public List<CatalogoItem> listarTodosPorTipo(String tipo) {
        return catalogoRepository.findByTipoOrderByOrdenAscNombreAsc(tipo);
    }

    public Optional<CatalogoItem> buscarPorId(Long id) {
        return catalogoRepository.findById(id);
    }

    @Transactional
    public CatalogoItem guardar(CatalogoItem item) {
        if (item.getId() == null && catalogoRepository.existsByTipoAndNombreIgnoreCase(item.getTipo(), item.getNombre())) {
            throw new IllegalArgumentException("Ya existe un registro con el nombre '" + item.getNombre() + "' en este catálogo.");
        }
        return catalogoRepository.save(item);
    }

    @Transactional
    public CatalogoItem actualizar(Long id, CatalogoItem itemActualizado) {
        CatalogoItem existente = catalogoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Elemento de catálogo no encontrado con ID: " + id));

        if (!existente.getNombre().equalsIgnoreCase(itemActualizado.getNombre()) &&
                catalogoRepository.existsByTipoAndNombreIgnoreCase(existente.getTipo(), itemActualizado.getNombre())) {
            throw new IllegalArgumentException("Ya existe otro registro con el nombre '" + itemActualizado.getNombre() + "' en este catálogo.");
        }

        existente.setNombre(itemActualizado.getNombre());
        existente.setCodigo(itemActualizado.getCodigo());
        if (itemActualizado.getOrden() != null) {
            existente.setOrden(itemActualizado.getOrden());
        }
        if (itemActualizado.getActivo() != null) {
            existente.setActivo(itemActualizado.getActivo());
        }

        return catalogoRepository.save(existente);
    }

    @Transactional
    public CatalogoItem toggleActivo(Long id) {
        CatalogoItem item = catalogoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Elemento de catálogo no encontrado con ID: " + id));
        item.setActivo(!Boolean.TRUE.equals(item.getActivo()));
        return catalogoRepository.save(item);
    }

    @Transactional
    public void eliminar(Long id) {
        catalogoRepository.deleteById(id);
    }
}
