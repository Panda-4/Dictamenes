package com.gem.dictamenes.util;

import com.gem.dictamenes.model.Solicitud;
import com.gem.dictamenes.dto.ExcelImportDto;
import com.gem.dictamenes.dto.FilaError;
import com.gem.dictamenes.repository.SolicitudRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

    // ─── MÉTODOS DE IMPORTACIÓN Y PLANTILLA ───────────────────────────────────────

    public static ExcelImportDto parseExcel(InputStream is, SolicitudRepository repository) throws IOException {
        ExcelImportDto importDto = new ExcelImportDto();
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int rowsCount = sheet.getLastRowNum();
            if (rowsCount < 1) {
                return importDto;
            }

            int startRow = 1;
            Row row0 = sheet.getRow(0);
            if (row0 != null) {
                Cell cell0 = row0.getCell(0);
                if (cell0 != null) {
                    String titleVal = cell0.toString();
                    if (titleVal.contains("REPORTE") || titleVal.contains("OFICIALÍA MAYOR") || titleVal.contains("PLANTILLA")) {
                        startRow = 2; // Formato con fila de título arriba
                    } else if (titleVal.equalsIgnoreCase("Folio Interno") || titleVal.contains("Dejar vacío") || titleVal.equalsIgnoreCase("Número de Oficio")) {
                        startRow = 1; // Formato plantilla estándar (cabeceras en fila 0)
                    }
                }
            }

            for (int i = startRow; i <= rowsCount; i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue; // Saltar filas completamente vacías
                }

                FilaError filaError = new FilaError();
                filaError.setNumeroFila(i + 1);

                int col = 0;
                // Col 0: Folio Interno (opcional)
                String folioStr = getCellString(row.getCell(col++));
                Long folioInterno = null;
                if (folioStr != null && !folioStr.trim().isEmpty()) {
                    try {
                        if (folioStr.endsWith(".0")) {
                            folioStr = folioStr.substring(0, folioStr.length() - 2);
                        }
                        folioInterno = Long.parseLong(folioStr.trim());
                    } catch (NumberFormatException e) {
                        // ignorar
                    }
                }

                // Col 1: Numero de Oficio
                String numeroOficio = getCellString(row.getCell(col++));
                filaError.setNumeroOficio(numeroOficio);

                // Col 2: Fecha Recepción DGRM/OM
                LocalDate fechaRecepcionDGRMOM = getCellDate(row.getCell(col++));
                
                // Col 3: Excepción DGRM/OM
                Boolean excepcionDGRMOM = getCellBoolean(row.getCell(col++));

                // Col 4: Fecha Recepción Dictaminación
                LocalDate fechaRecepcionDictaminacion = getCellDate(row.getCell(col++));

                // Col 5: Excepción Dictaminación
                Boolean excepcionDictaminacion = getCellBoolean(row.getCell(col++));

                // Col 6: Dependencia / OPD
                String dependenciaOPD = getCellString(row.getCell(col++));

                // Col 7: Unidad Administrativa
                String unidadAdministrativa = getCellString(row.getCell(col++));

                // Col 8: Centro de Costos
                String centroCostos = getCellString(row.getCell(col++));

                // Col 9: Capítulo
                String capitulo = getCellString(row.getCell(col++));

                // Col 10: Partida Presupuestal
                String partidaPresupuestal = getCellString(row.getCell(col++));

                // Col 11: Giro
                String giro = getCellString(row.getCell(col++));

                // Col 12: Monto Solicitud
                BigDecimal montoSolicitud = getCellDecimal(row.getCell(col++));

                // Col 13: Tipo de Solicitud
                String tipoSolicitud = getCellString(row.getCell(col++));

                // Col 14: Estatus General
                String estatusGeneral = getCellString(row.getCell(col++));
                if (estatusGeneral == null || estatusGeneral.trim().isEmpty()) {
                    estatusGeneral = "En Opinión Técnica de Subdirección de Fianzas y Seguros";
                }

                // Col 15: Descripción Solicitud
                String descripcionSolicitud = getCellString(row.getCell(col++));

                // Col 16: Procedente
                Boolean procedente = getCellBoolean(row.getCell(col++));

                // Col 17: Fecha Envío Autorización OM
                LocalDate fechaEnvioAutorizacionOM = getCellDate(row.getCell(col++));

                // Col 18: Fecha Emisión Autorización
                LocalDate fechaEmisionAutorizacion = getCellDate(row.getCell(col++));

                // Col 19: Fecha Envío Firma DG
                LocalDate fechaEnvioFirmaDG = getCellDate(row.getCell(col++));

                // Col 20: Fecha Envío Dependencia
                LocalDate fechaEnvioDependencia = getCellDate(row.getCell(col++));

                // Col 21: Fecha Envío Respuesta Firma DG
                LocalDate fechaEnvioRespuestaFirmaDG = getCellDate(row.getCell(col++));

                // Col 22: Fecha Envío Respuesta Dependencia
                LocalDate fechaEnvioRespuestaDependencia = getCellDate(row.getCell(col++));

                // Col 23: Cuenta Dictamen Previo
                String cuentaDictamenPrevio = getCellString(row.getCell(col++));

                // Col 24: Fecha Emisión Dictamen Previo
                LocalDate fechaEmisionDictamenPrevio = getCellDate(row.getCell(col++));

                // Col 25: Nro. Oficio Dictamen Previo
                String numeroOficioDictamenPrevio = getCellString(row.getCell(col++));

                // Col 26: Cuenta Excepción Austeridad
                String cuentaExcepcionAusteridad = getCellString(row.getCell(col++));

                // Col 27: Fecha Emisión Excepción
                LocalDate fechaEmisionExcepcion = getCellDate(row.getCell(col++));

                // Col 28: Monto Estudio de Mercado
                BigDecimal montoEstudioMercado = getCellDecimal(row.getCell(col++));

                // Col 29: Cuenta Autorización OM
                Boolean cuentaAutorizacionOM = getCellBoolean(row.getCell(col++));

                // Col 30: Nro. Oficio Autorización
                String numeroOficioAutorizacion = getCellString(row.getCell(col++));

                // Col 31: Fecha Respuesta OM→DGRM
                LocalDate fechaEnvioRespuestaOM_DGRM = getCellDate(row.getCell(col++));

                // Col 32: Fecha Recepción DGRM
                LocalDate fechaRecepcionDGRM = getCellDate(row.getCell(col++));

                // Col 33: Fecha Respuesta DGRM→Dependencia
                LocalDate fechaRespuestaDGRM_Dependencia = getCellDate(row.getCell(col++));

                // Col 34: Nro. Oficio Respuesta
                String numeroOficioRespuesta = getCellString(row.getCell(col++));

                // Col 35: Tipo de Excepción
                String tipoExcepcion = getCellString(row.getCell(col++));

                // Col 36: Descripción Excepción
                String descripcionExcepcion = getCellString(row.getCell(col++));

                // Col 37: Monto Suficiencia Presupuestal
                BigDecimal montoSuficienciaPresupuestal = getCellDecimal(row.getCell(col++));

                // Col 38: Fecha Respuesta Excepción
                LocalDate fechaRespuestaExcepcion = getCellDate(row.getCell(col++));

                Solicitud s = new Solicitud();
                s.setFolioInterno(folioInterno);
                s.setNumeroOficioSolicitud(numeroOficio);
                s.setFechaRecepcionDGRMOM(fechaRecepcionDGRMOM);
                s.setExcepcionDGRMOM(excepcionDGRMOM);
                s.setFechaRecepcionDictaminacion(fechaRecepcionDictaminacion);
                s.setExcepcionDictaminacion(excepcionDictaminacion);
                s.setDependenciaOPD(dependenciaOPD);
                s.setUnidadAdministrativa(unidadAdministrativa);
                s.setCentroCostos(centroCostos);
                s.setCapitulo(capitulo);
                s.setPartidaPresupuestal(partidaPresupuestal);
                s.setGiro(giro);
                s.setMontoSolicitud(montoSolicitud);
                s.setTipoSolicitud(tipoSolicitud);
                s.setEstatusGeneral(estatusGeneral);
                s.setDescripcionSolicitud(descripcionSolicitud);
                s.setProcedente(procedente);
                s.setFechaEnvioAutorizacionOM(fechaEnvioAutorizacionOM);
                s.setFechaEmisionAutorizacion(fechaEmisionAutorizacion);
                s.setFechaEnvioFirmaDG(fechaEnvioFirmaDG);
                s.setFechaEnvioDependencia(fechaEnvioDependencia);
                s.setFechaEnvioRespuestaFirmaDG(fechaEnvioRespuestaFirmaDG);
                s.setFechaEnvioRespuestaDependencia(fechaEnvioRespuestaDependencia);
                s.setCuentaDictamenPrevio(cuentaDictamenPrevio);
                s.setFechaEmisionDictamenPrevio(fechaEmisionDictamenPrevio);
                s.setNumeroOficioDictamenPrevio(numeroOficioDictamenPrevio);
                s.setCuentaExcepcionAusteridad(cuentaExcepcionAusteridad);
                s.setFechaEmisionExcepcion(fechaEmisionExcepcion);
                s.setMontoEstudioMercado(montoEstudioMercado);
                s.setCuentaAutorizacionOM(cuentaAutorizacionOM);
                s.setNumeroOficioAutorizacion(numeroOficioAutorizacion);
                s.setFechaEnvioRespuestaOM_DGRM(fechaEnvioRespuestaOM_DGRM);
                s.setFechaRecepcionDGRM(fechaRecepcionDGRM);
                s.setFechaRespuestaDGRM_Dependencia(fechaRespuestaDGRM_Dependencia);
                s.setNumeroOficioRespuesta(numeroOficioRespuesta);
                s.setTipoExcepcion(tipoExcepcion);
                s.setDescripcionExcepcion(descripcionExcepcion);
                s.setMontoSuficienciaPresupuestal(montoSuficienciaPresupuestal);
                s.setFechaRespuestaExcepcion(fechaRespuestaExcepcion);

                if (!filaError.getMensajes().isEmpty()) {
                    importDto.getErrores().add(filaError);
                } else {
                    if (numeroOficio != null && !numeroOficio.trim().isEmpty()) {
                        java.util.Optional<Solicitud> duplicate = repository != null ? repository.findByNumeroOficioSolicitud(numeroOficio.trim()) : java.util.Optional.empty();
                        if (duplicate.isPresent()) {
                            if (folioInterno != null && folioInterno.equals(duplicate.get().getFolioInterno())) {
                                importDto.getValidos().add(s);
                            } else {
                                s.setFolioInterno(duplicate.get().getFolioInterno()); // Asignar el folio existente para potencial actualización
                                importDto.getDuplicados().add(s);
                            }
                        } else {
                            importDto.getValidos().add(s);
                        }
                    } else {
                        importDto.getValidos().add(s);
                    }
                }
            }
        }
        return importDto;
    }

    public static byte[] generateTemplate() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Plantilla de Importación");

            // Fila 0: Título
            Row titulo = sheet.createRow(0);
            titulo.setHeightInPoints(30);
            Cell celdaTitulo = titulo.createCell(0);
            celdaTitulo.setCellValue("PLANTILLA OFICIAL DE IMPORTACIÓN — GESTIÓN DE DICTÁMENES");
            celdaTitulo.setCellStyle(buildTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 38));

            // Fila 1: Encabezados
            Row header = sheet.createRow(1);
            header.setHeightInPoints(36);
            CellStyle headerStyle = buildHeaderStyle(workbook);

            String[] columnas = {
                "Folio Interno (Dejar vacío)",
                "Número de Oficio *",
                "Fecha Recepción DGRM/OM (YYYY-MM-DD)",
                "Excepción DGRM/OM (Sí/No)",
                "Fecha Recepción Dictaminación (YYYY-MM-DD)",
                "Excepción Dictaminación (Sí/No)",
                "Dependencia / OPD *",
                "Unidad Administrativa *",
                "Centro de Costos",
                "Capítulo",
                "Partida Presupuestal *",
                "Giro",
                "Monto de la Solicitud *",
                "Tipo de Solicitud *",
                "Estatus General *",
                "Descripción de la Solicitud",
                "Procedente (Sí/No)",
                "Fecha Envío Autorización OM (YYYY-MM-DD)",
                "Fecha Emisión Autorización (YYYY-MM-DD)",
                "Fecha Envío Firma DG (YYYY-MM-DD)",
                "Fecha Envío Dependencia (YYYY-MM-DD)",
                "Fecha Envío Respuesta Firma DG (YYYY-MM-DD)",
                "Fecha Envío Respuesta Dependencia (YYYY-MM-DD)",
                "Cuenta Dictamen Previo",
                "Fecha Emisión Dictamen Previo (YYYY-MM-DD)",
                "Nro. Oficio Dictamen Previo",
                "Cuenta Excepción Austeridad",
                "Fecha Emisión Excepción (YYYY-MM-DD)",
                "Monto Estudio de Mercado",
                "Cuenta Autorización OM (Sí/No)",
                "Nro. Oficio Autorización",
                "Fecha Respuesta OM→DGRM (YYYY-MM-DD)",
                "Fecha Recepción DGRM (YYYY-MM-DD)",
                "Fecha Respuesta DGRM→Dependencia (YYYY-MM-DD)",
                "Nro. Oficio Respuesta",
                "Tipo de Excepción",
                "Descripción Excepción",
                "Monto Suficiencia Presupuestal",
                "Fecha Respuesta Excepción (YYYY-MM-DD)"
            };

            for (int i = 0; i < columnas.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fila 2: Registro de Ejemplo
            Row row = sheet.createRow(2);
            row.setHeightInPoints(18);
            CellStyle evenRowStyle = buildEvenRowStyle(workbook);
            CellStyle dateStyle = buildDateStyle(workbook);
            CellStyle moneyStyle = buildMoneyStyle(workbook);

            int col = 0;
            setStrCell(row, col++, "", evenRowStyle); // Folio
            setStrCell(row, col++, "OF-3321/2026", evenRowStyle); // Número de Oficio
            setDateCell(row, col++, LocalDate.now(), dateStyle, true); // Fecha Recepción
            setStrCell(row, col++, "No", evenRowStyle); // Excepción DGRM
            setDateCell(row, col++, LocalDate.now(), dateStyle, true); // Fecha Dictaminación
            setStrCell(row, col++, "No", evenRowStyle); // Excepción Dictaminación
            setStrCell(row, col++, "Secretaría de Finanzas", evenRowStyle); // Dependencia
            setStrCell(row, col++, "Dirección General de Recursos Materiales", evenRowStyle); // Unidad
            setStrCell(row, col++, "204B00000", evenRowStyle); // Centro Costos
            setStrCell(row, col++, "3000", evenRowStyle); // Capítulo
            setStrCell(row, col++, "3391", evenRowStyle); // Partida
            setStrCell(row, col++, "Servicios de Asesoría", evenRowStyle); // Giro
            setMoneyCell(row, col++, new BigDecimal("120500.00"), moneyStyle, true); // Monto
            setStrCell(row, col++, "Dictamen de Suficiencia", evenRowStyle); // Tipo
            setStrCell(row, col++, "Recibida", evenRowStyle); // Estatus
            setStrCell(row, col++, "Este es un registro de ejemplo para la carga.", evenRowStyle); // Descripción
            setStrCell(row, col++, "Sí", evenRowStyle); // Procedente
            
            // Llenar el resto del ejemplo con vacíos
            for (int c = col; c < columnas.length; c++) {
                setStrCell(row, c, "", evenRowStyle);
            }

            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
                int ancho = sheet.getColumnWidth(i);
                if (ancho < 3000)  sheet.setColumnWidth(i, 3000);
                if (ancho > 14000) sheet.setColumnWidth(i, 14000);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private static String getCellString(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                return cell.getLocalDateTimeCellValue().toLocalDate().toString();
            }
            double val = cell.getNumericCellValue();
            if (val == (long) val) {
                return String.valueOf((long) val);
            }
            return BigDecimal.valueOf(val).toPlainString();
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        } else if (cell.getCellType() == CellType.BLANK) {
            return null;
        }
        return cell.toString().trim();
    }

    private static LocalDate getCellDate(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            }
            try {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            } catch (Exception e) {
                // ignorar
            }
        }
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            if (val.isEmpty()) return null;
            String[] formats = {"yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy", "yyyy/MM/dd", "dd-MM-yyyy", "yyyy-M-d", "d-M-yyyy"};
            for (String f : formats) {
                try {
                    return LocalDate.parse(val, DateTimeFormatter.ofPattern(f));
                } catch (DateTimeParseException e) {
                    // probar el siguiente
                }
            }
        }
        return null;
    }

    private static Boolean getCellBoolean(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        }
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim().toLowerCase();
            if (val.equals("sí") || val.equals("si") || val.equals("yes") || val.equals("true") || val.equals("1") || val.equals("s")) {
                return true;
            }
            if (val.equals("no") || val.equals("false") || val.equals("0") || val.equals("n")) {
                return false;
            }
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue() == 1.0;
        }
        return null;
    }

    private static BigDecimal getCellDecimal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim().replace("$", "").replace(",", "");
            if (val.isEmpty()) return null;
            try {
                return new BigDecimal(val);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private static boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                // Si el string de la celda no está vacío
                if (cell.getCellType() == CellType.STRING && cell.getStringCellValue().trim().isEmpty()) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }
}
