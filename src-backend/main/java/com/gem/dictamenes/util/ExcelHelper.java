package com.gem.dictamenes.util;

import com.gem.dictamenes.model.Solicitud;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ExcelHelper {

    // Colores corporativos GEM
    private static final String COLOR_GRANATE  = "951F45"; // guinda principal
    private static final String COLOR_DORADO   = "D4AF37"; // dorado corporativo
    private static final String COLOR_FILA_PAR = "FDF2F5"; // rosa muy claro para filas pares

    public static byte[] solicitudesToExcel(List<Solicitud> solicitudes) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Reporte General de Solicitudes");

            // ─── FILA TÍTULO ───────────────────────────────────────────────
            Row titulo = sheet.createRow(0);
            titulo.setHeightInPoints(30);
            Cell celdaTitulo = titulo.createCell(0);
            celdaTitulo.setCellValue("REPORTE GENERAL DE SOLICITUDES — DGRM / OFICIALÍA MAYOR");
            celdaTitulo.setCellStyle(buildTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 38)); // Combinar todas las columnas del título

            // ─── FILA ENCABEZADOS ──────────────────────────────────────────
            Row header = sheet.createRow(1);
            header.setHeightInPoints(36);
            CellStyle headerStyle = buildHeaderStyle(workbook);

            String[] columnas = {
                "Folio Interno",
                "Número de Oficio",
                "Fecha Recepción DGRM/OM",
                "Excepción DGRM/OM",
                "Fecha Recepción Dictaminación",
                "Excepción Dictaminación",
                "Dependencia / OPD",
                "Unidad Administrativa",
                "Centro de Costos",
                "Capítulo",
                "Partida Presupuestal",
                "Giro",
                "Monto de la Solicitud",
                "Tipo de Solicitud",
                "Estatus General",
                "Descripción de la Solicitud",
                "Procedente",
                "Fecha Envío Autorización OM",
                "Fecha Emisión Autorización",
                "Fecha Envío Firma DG",
                "Fecha Envío Dependencia",
                "Fecha Envío Respuesta Firma DG",
                "Fecha Envío Respuesta Dependencia",
                "Cuenta Dictamen Previo",
                "Fecha Emisión Dictamen Previo",
                "Nro. Oficio Dictamen Previo",
                "Cuenta Excepción Austeridad",
                "Fecha Emisión Excepción",
                "Monto Estudio de Mercado",
                "Cuenta Autorización OM",
                "Nro. Oficio Autorización",
                "Fecha Respuesta OM→DGRM",
                "Fecha Recepción DGRM",
                "Fecha Respuesta DGRM→Dependencia",
                "Nro. Oficio Respuesta",
                "Tipo de Excepción",
                "Descripción Excepción",
                "Monto Suficiencia Presupuestal",
                "Fecha Respuesta Excepción"
            };

            for (int i = 0; i < columnas.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }

            // ─── ESTILOS DE DATO ───────────────────────────────────────────
            CellStyle dateStyle    = buildDateStyle(workbook);
            CellStyle moneyStyle   = buildMoneyStyle(workbook);
            CellStyle evenRowStyle = buildEvenRowStyle(workbook);
            CellStyle oddRowStyle  = buildOddRowStyle(workbook);

            // ─── DATOS ─────────────────────────────────────────────────────
            int rowIdx = 2;
            for (Solicitud s : solicitudes) {
                Row row = sheet.createRow(rowIdx);
                row.setHeightInPoints(18);
                boolean esPar = (rowIdx % 2 == 0);
                CellStyle baseStyle = esPar ? evenRowStyle : oddRowStyle;

                int col = 0;

                // Folio Interno
                setNumCell(row, col++, s.getFolioInterno() != null ? s.getFolioInterno().doubleValue() : null, baseStyle);
                // Número de Oficio
                setStrCell(row, col++, s.getNumeroOficioSolicitud(), baseStyle);
                // Fecha Recepción DGRM/OM
                setDateCell(row, col++, s.getFechaRecepcionDGRMOM(), dateStyle, esPar);
                // Excepción DGRM/OM
                setStrCell(row, col++, boolStr(s.getExcepcionDGRMOM()), baseStyle);
                // Fecha Recepción Dictaminación
                setDateCell(row, col++, s.getFechaRecepcionDictaminacion(), dateStyle, esPar);
                // Excepción Dictaminación
                setStrCell(row, col++, boolStr(s.getExcepcionDictaminacion()), baseStyle);
                // Dependencia / OPD
                setStrCell(row, col++, s.getDependenciaOPD(), baseStyle);
                // Unidad Administrativa
                setStrCell(row, col++, s.getUnidadAdministrativa(), baseStyle);
                // Centro de Costos
                setStrCell(row, col++, s.getCentroCostos(), baseStyle);
                // Capítulo
                setStrCell(row, col++, s.getCapitulo(), baseStyle);
                // Partida Presupuestal
                setStrCell(row, col++, s.getPartidaPresupuestal(), baseStyle);
                // Giro
                setStrCell(row, col++, s.getGiro(), baseStyle);
                // Monto Solicitud
                setMoneyCell(row, col++, s.getMontoSolicitud(), moneyStyle, esPar);
                // Tipo de Solicitud
                setStrCell(row, col++, s.getTipoSolicitud(), baseStyle);
                // Estatus General
                setStrCell(row, col++, s.getEstatusGeneral(), baseStyle);
                // Descripción Solicitud
                setStrCell(row, col++, s.getDescripcionSolicitud(), baseStyle);
                // Procedente
                setStrCell(row, col++, boolStr(s.getProcedente()), baseStyle);
                // Fecha Envío Autorización OM
                setDateCell(row, col++, s.getFechaEnvioAutorizacionOM(), dateStyle, esPar);
                // Fecha Emisión Autorización
                setDateCell(row, col++, s.getFechaEmisionAutorizacion(), dateStyle, esPar);
                // Fecha Envío Firma DG
                setDateCell(row, col++, s.getFechaEnvioFirmaDG(), dateStyle, esPar);
                // Fecha Envío Dependencia
                setDateCell(row, col++, s.getFechaEnvioDependencia(), dateStyle, esPar);
                // Fecha Envío Respuesta Firma DG
                setDateCell(row, col++, s.getFechaEnvioRespuestaFirmaDG(), dateStyle, esPar);
                // Fecha Envío Respuesta Dependencia
                setDateCell(row, col++, s.getFechaEnvioRespuestaDependencia(), dateStyle, esPar);
                // Cuenta Dictamen Previo
                setStrCell(row, col++, s.getCuentaDictamenPrevio(), baseStyle);
                // Fecha Emisión Dictamen Previo
                setDateCell(row, col++, s.getFechaEmisionDictamenPrevio(), dateStyle, esPar);
                // Nro. Oficio Dictamen Previo
                setStrCell(row, col++, s.getNumeroOficioDictamenPrevio(), baseStyle);
                // Cuenta Excepción Austeridad
                setStrCell(row, col++, s.getCuentaExcepcionAusteridad(), baseStyle);
                // Fecha Emisión Excepción
                setDateCell(row, col++, s.getFechaEmisionExcepcion(), dateStyle, esPar);
                // Monto Estudio de Mercado
                setMoneyCell(row, col++, s.getMontoEstudioMercado(), moneyStyle, esPar);
                // Cuenta Autorización OM
                setStrCell(row, col++, boolStr(s.getCuentaAutorizacionOM()), baseStyle);
                // Nro. Oficio Autorización
                setStrCell(row, col++, s.getNumeroOficioAutorizacion(), baseStyle);
                // Fecha Respuesta OM→DGRM
                setDateCell(row, col++, s.getFechaEnvioRespuestaOM_DGRM(), dateStyle, esPar);
                // Fecha Recepción DGRM
                setDateCell(row, col++, s.getFechaRecepcionDGRM(), dateStyle, esPar);
                // Fecha Respuesta DGRM→Dependencia
                setDateCell(row, col++, s.getFechaRespuestaDGRM_Dependencia(), dateStyle, esPar);
                // Nro. Oficio Respuesta
                setStrCell(row, col++, s.getNumeroOficioRespuesta(), baseStyle);
                // Tipo de Excepción
                setStrCell(row, col++, s.getTipoExcepcion(), baseStyle);
                // Descripción Excepción
                setStrCell(row, col++, s.getDescripcionExcepcion(), baseStyle);
                // Monto Suficiencia Presupuestal
                setMoneyCell(row, col++, s.getMontoSuficienciaPresupuestal(), moneyStyle, esPar);
                // Fecha Respuesta Excepción
                setDateCell(row, col++, s.getFechaRespuestaExcepcion(), dateStyle, esPar);

                rowIdx++;
            }

            // ─── AUTO-AJUSTE DE COLUMNAS ───────────────────────────────────
            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
                // Establecer un ancho mínimo de 12 caracteres y máximo de 50
                int ancho = sheet.getColumnWidth(i);
                if (ancho < 3000)  sheet.setColumnWidth(i, 3000);
                if (ancho > 14000) sheet.setColumnWidth(i, 14000);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ─── HELPERS DE CELDA ─────────────────────────────────────────────────────

    private static void setStrCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private static void setNumCell(Row row, int col, Double value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value != null) cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private static void setDateCell(Row row, int col, LocalDate date, CellStyle dateStyle, boolean esPar) {
        Cell cell = row.createCell(col);
        if (date != null) {
            cell.setCellValue(date.toString());
        }
        cell.setCellStyle(dateStyle);
    }

    private static void setMoneyCell(Row row, int col, BigDecimal value, CellStyle moneyStyle, boolean esPar) {
        Cell cell = row.createCell(col);
        if (value != null) cell.setCellValue(value.doubleValue());
        cell.setCellStyle(moneyStyle);
    }

    private static String boolStr(Boolean b) {
        if (b == null) return "";
        return b ? "Sí" : "No";
    }

    // ─── BUILDERS DE ESTILO ───────────────────────────────────────────────────

    private static CellStyle buildTitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFColor granate = new XSSFColor(hexToBytes(COLOR_GRANATE), null);
        style.setFillForegroundColor(granate);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(new XSSFColor(hexToBytes("FFFFFF"), null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private static CellStyle buildHeaderStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFColor granate = new XSSFColor(hexToBytes(COLOR_GRANATE), null);
        XSSFColor dorado  = new XSSFColor(hexToBytes(COLOR_DORADO), null);

        style.setFillForegroundColor(granate);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(hexToBytes("FFFFFF"), null));
        style.setFont(font);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);

        // Borde inferior dorado
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBottomBorderColor(dorado);
        style.setBorderTop(BorderStyle.THIN);
        style.setTopBorderColor(granate);
        style.setBorderLeft(BorderStyle.THIN);
        style.setLeftBorderColor(dorado);
        style.setBorderRight(BorderStyle.THIN);
        style.setRightBorderColor(dorado);
        return style;
    }

    private static CellStyle buildDateStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setDataFormat(wb.createDataFormat().getFormat("yyyy-MM-dd"));
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorderThin(style);
        return style;
    }

    private static CellStyle buildMoneyStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setDataFormat(wb.createDataFormat().getFormat("\"$\"#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        setBorderThin(style);
        return style;
    }

    private static CellStyle buildEvenRowStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFColor rosa = new XSSFColor(hexToBytes(COLOR_FILA_PAR), null);
        style.setFillForegroundColor(rosa);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorderThin(style);
        return style;
    }

    private static CellStyle buildOddRowStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorderThin(style);
        return style;
    }

    private static void setBorderThin(XSSFCellStyle style) {
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setBorderRight(BorderStyle.THIN);
        style.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
