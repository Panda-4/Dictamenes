package com.gem.dictamenes.dto;

import com.gem.dictamenes.model.Solicitud;
import java.util.ArrayList;
import java.util.List;

public class ExcelImportDto {
    private List<Solicitud> validos = new ArrayList<>();
    private List<Solicitud> duplicados = new ArrayList<>();
    private List<FilaError> errores = new ArrayList<>();

    public ExcelImportDto() {}

    public ExcelImportDto(List<Solicitud> validos, List<Solicitud> duplicados, List<FilaError> errores) {
        this.validos = validos;
        this.duplicados = duplicados;
        this.errores = errores;
    }

    public List<Solicitud> getValidos() {
        return validos;
    }

    public void setValidos(List<Solicitud> validos) {
        this.validos = validos;
    }

    public List<Solicitud> getDuplicados() {
        return duplicados;
    }

    public void setDuplicados(List<Solicitud> duplicados) {
        this.duplicados = duplicados;
    }

    public List<FilaError> getErrores() {
        return errores;
    }

    public void setErrores(List<FilaError> errores) {
        this.errores = errores;
    }
}
