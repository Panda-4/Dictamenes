export type TipoSolicitud = 
  | "Dictamen Técnico"
  | "Dictamen de Procedencia"
  | "Opinión Técnica Previa"
  | "Dictamen Previo"
  | "Excepción a Medidas de Austeridad"
  | "";

export type EstatusDictamen = 
  | "En Opinión Técnica de Subdirección de Fianzas y Seguros"
  | "En proceso de elaboración"
  | "En Firma de Dirección General"
  | "En autorización de la OM"
  | "Concluido Entregado a dependencia solicitante";

export interface SolicitudModel {
  folioInterno?: number;
  numeroOficioSolicitud: string;
  fechaRecepcionDGRMOM: string;
  excepcionDGRMOM: boolean;
  fechaRecepcionDictaminacion: string;
  excepcionDictaminacion: boolean;
  dependenciaOPD: string;
  unidadAdministrativa: string;
  centroCostos?: string;
  capitulo?: string;
  partidaPresupuestal: string;
  giro?: string;
  montoSolicitud: number;
  tipoSolicitud: TipoSolicitud;
  estatusGeneral: EstatusDictamen;
  
  // Subform A & B
  descripcionSolicitud?: string;
  procedente?: boolean | null;
  
  // Si Procedente = Sí
  fechaEnvioAutorizacionOM?: string;
  fechaEmisionAutorizacion?: string;
  fechaEnvioFirmaDG?: string;
  fechaEnvioDependencia?: string;

  // Si Procedente = No
  fechaEnvioRespuestaFirmaDG?: string;
  fechaEnvioRespuestaDependencia?: string;

  // Solo para Sub A
  cuentaDictamenPrevio?: "Sí" | "No" | "N/A" | "";
  fechaEmisionDictamenPrevio?: string;
  numeroOficioDictamenPrevio?: string;

  cuentaExcepcionAusteridad?: "Sí" | "No" | "N/A" | "";
  fechaEmisionExcepcion?: string;

  montoEstudioMercado?: number;
  fechaEnvioAutorizacionOM_A?: string;
  cuentaAutorizacionOM?: boolean | null;
  
  // OM - A
  numeroOficioAutorizacion?: string;
  fechaEnvioRespuestaOM_DGRM?: string;
  fechaRecepcionDGRM?: string;
  fechaRespuestaDGRM_Dependencia?: string;
  
  // No Autorización OM
  numeroOficioRespuesta?: string;

  // Subform C
  tipoExcepcion?: string;
  descripcionExcepcion?: string;
  montoSuficienciaPresupuestal?: number;
  fechaRespuestaExcepcion?: string;
}
