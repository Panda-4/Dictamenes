package com.gem.dictamenes.dto;

import java.util.Objects;

public class LoginResponse {
    private String token;
    private String username;
    private String rol;
    private String nombreCompleto;

    public LoginResponse() {}

    public LoginResponse(String token, String username, String rol, String nombreCompleto) {
        this.token = token;
        this.username = username;
        this.rol = rol;
        this.nombreCompleto = nombreCompleto;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LoginResponse that = (LoginResponse) o;
        return Objects.equals(token, that.token) && Objects.equals(username, that.username) && Objects.equals(rol, that.rol) && Objects.equals(nombreCompleto, that.nombreCompleto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(token, username, rol, nombreCompleto);
    }
}
