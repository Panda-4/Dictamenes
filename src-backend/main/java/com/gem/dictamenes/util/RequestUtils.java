package com.gem.dictamenes.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class RequestUtils {

    public static HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) return "Desconocido";
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // Si hay una lista de IPs (debido a múltiples proxies), tomamos la primera
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        // Normalizar localhost IPv6 a formato IPv4 estándar
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        
        return ip != null ? ip : "Desconocido";
    }

    public static String getDevice(HttpServletRequest request) {
        if (request == null) return "Desconocido";
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null || userAgent.isEmpty()) return "Desconocido";

        String parser = userAgent.toLowerCase();
        String os = "Desconocido OS";
        String browser = "Desconocido";

        // Detectar Sistema Operativo
        if (parser.contains("windows")) {
            os = "Windows";
        } else if (parser.contains("macintosh") || parser.contains("mac os x")) {
            os = "macOS";
        } else if (parser.contains("android")) {
            os = "Android";
        } else if (parser.contains("iphone") || parser.contains("ipad") || parser.contains("ipod")) {
            os = "iOS";
        } else if (parser.contains("linux")) {
            os = "Linux";
        }

        // Detectar Navegador
        if (parser.contains("edg")) {
            browser = "Edge";
        } else if (parser.contains("opr") || parser.contains("opera")) {
            browser = "Opera";
        } else if (parser.contains("chrome")) {
            browser = "Chrome";
        } else if (parser.contains("firefox")) {
            browser = "Firefox";
        } else if (parser.contains("safari")) {
            browser = "Safari";
        }

        return os + " / " + browser;
    }
}
