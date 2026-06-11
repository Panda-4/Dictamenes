package com.gem.dictamenes.dto;

import java.util.ArrayList;
import java.util.List;

public class FilaError {
    private int numeroFila;
    private String numeroOficio;
    private List<String> mensajes = new ArrayList<>();

    public FilaError() {}

    public FilaError(int numeroFila, String numeroOficio, List<String> mensajes) {
        this.numeroFila = numeroFila;
        this.numeroOficio = numeroOficio;
        this.mensajes = mensajes;
    }

    public int getNumeroFila() {
        return numeroFila;
    }

    public void setNumeroFila(int numeroFila) {
        this.numeroFila = numeroFila;
    }

    public String getNumeroOficio() {
        return numeroOficio;
    }

    public void setNumeroOficio(String numeroOficio) {
        this.numeroOficio = numeroOficio;
    }

    public List<String> getMensajes() {
        return mensajes;
    }

    public void setMensajes(List<String> mensajes) {
        this.mensajes = mensajes;
    }

    public void addMensaje(String mensaje) {
        this.mensajes.add(mensaje);
    }
}
