import numberToText from "./numberToText"

const recaptchaSiteKey = "6Ldkk94ZAAAAAOBdw8kaUOZvUTP6X7zZ_Mi2GZah";
const GOOGLE_MAPS_API_KEY = "AIzaSyAhlPrBYLBUk9cL9YFuMbK4pEAmdrtWpO4";

function dateBdToUi(date_string) {
    if (date_string && date_string.length >= 7) {
        var t_ano = date_string.substring(0, 4);
        var t_mes = date_string.substring(5, 7);

        if (date_string.length == 7) {//solo mes y año
            return mesATexto(t_mes) + " " + t_ano;
        }
        else {
            var t_dia = date_string.substring(8, 10);

            if (date_string.length == 10) {//solo dia mes y año
                return t_dia + "/" + t_mes + "/" + t_ano;
            }
            else {//dia mes año y hora
                var t_hora = date_string.substring(11, 13);
                var t_min = date_string.substring(14, 16);
                return t_dia + "/" + t_mes + "/" + t_ano + " " + t_hora + ":" + t_min;
            }
        }
    }
    return "";
}
const mesATexto = (p_mes) => {
    switch (p_mes * 1) {
        case 1: return "Enero";
        case 2: return "Febrero";
        case 3: return "Marzo";
        case 4: return "Abril";
        case 5: return "Mayo";
        case 6: return "Junio";
        case 7: return "Julio";
        case 8: return "Agosto";
        case 9: return "Septiembre";
        case 10: return "Octubre";
        case 11: return "Noviembre";
        case 12: return "Diciembre";
    }
    return "";
};

const meses = [
    { id: 1, nombre: "1 - Enero" },
    { id: 2, nombre: "2 - Febrero" },
    { id: 3, nombre: "3 - Marzo" },
    { id: 4, nombre: "4 - Abril" },
    { id: 5, nombre: "5 - Mayo" },
    { id: 6, nombre: "6 - Junio" },
    { id: 7, nombre: "7 - Julio" },
    { id: 8, nombre: "8 - Agosto" },
    { id: 9, nombre: "9 - Septiembre" },
    { id: 10, nombre: "10 - Octubre" },
    { id: 11, nombre: "11 - Noviembre" },
    { id: 12, nombre: "12 - Diciembre" },
];

//transforma a texto el valor de id de un array
const arrayDataToString = (p_array, p_data) => {
    var t_return = "";
    p_array.forEach(e => {
        if (e.id == p_data) {
            t_return = e.toString ? e.toString : e.nombre ? e.nombre : e.text ? e.text : "undefined text";
        }
    });
    return t_return;
};
const getArrayDataById = (p_array, p_id) => {
    var t_return = null;
    p_array.forEach(e => {
        if (e.id == p_id)
            t_return = e;
    });
    return t_return;
};

const genero = [
    { id: 'o', nombre: "Masculino" },
    { id: 'a', nombre: "Femenino" },
    { id: 'e', nombre: "Inclusivo" },
];

const sexo = [
    { id: 1, nombre: "1 - Masculino", str: "masculino" },
    { id: 2, nombre: "2 - Femenino", str: "femenino" },
    { id: 3, nombre: "3 - Indeterminado", str: "indeterminado" },
    { id: 9, nombre: "9 - Ignorado", str: "ignorado" },
];

const unidad_edad = [
    { id: 1, nombre: "1 - Años", toString: "años" },
    { id: 2, nombre: "2 - Meses", toString: "meses" },
    { id: 3, nombre: "3 - Días", toString: "días" },
    { id: 4, nombre: "4 - Horas", toString: "horas" },
    { id: 5, nombre: "5 - Minutos", toString: "minutos" },
    { id: 9, nombre: "9 - Ignorado", toString: "ignorado" },
];

const es_derivado = [
    { id: 1, nombre: "Paciente Derivado" },
    { id: 0, nombre: "Paciente Recibido" },
];

const cobertura_medica = [
    { id: 1, nombre: "1 - Obra Social" },
    { id: 2, nombre: "2 - Plan de salud privado o Mutual" },
    { id: 3, nombre: "3 - Plan o Seguro público" },
    { id: 4, nombre: "4 - Más de una" },
    { id: 5, nombre: "5 - Ninguna" },
    { id: 9, nombre: "9 - Ignorada" },
];

const nivel_instruccion = [
    { id: 1, nombre: "1 - Nunca asistió" },
    { id: 2, nombre: "2 - Primario incompleto" },
    { id: 3, nombre: "3 - Primario completo" },
    { id: 4, nombre: "4 - Secundario incompleto" },
    { id: 5, nombre: "5 - Secundario completo" },
    { id: 6, nombre: "6 - Superior o Universitario incompleto" },
    { id: 7, nombre: "7 - Superior o Universitario completo" },
    { id: 11, nombre: "11 - EGB (1° y 2°) incompleto" },
    { id: 12, nombre: "12 - EGB (1° y 2°) completo" },
    { id: 13, nombre: "13 - EGB 3° incompleto" },
    { id: 14, nombre: "14 - EGB 3° completo" },
    { id: 15, nombre: "15 - Polimodal incompleto" },
    { id: 16, nombre: "16 - Polimodal completo" },
    { id: 99, nombre: "99 - Ignorado" },
];

const situacion_laboral = [
    { id: 1, nombre: "1 - Trabaja o está de licencia" },
    { id: 2, nombre: "2 - No trabaja y busca uno" },
    { id: 3, nombre: "3 - No trabaja y no busca uno" },
    { id: 9, nombre: "9 - Ignorada" },
];

const tipo_egreso = [
    { id: 1, nombre: "1 - Alta médica" },
    { id: 2, nombre: "2 - Traslado" },
    { id: 3, nombre: "3 - Defunción" },
    { id: 4, nombre: "4 - Retiro voluntario" },
    { id: 5, nombre: "5 - Otros" },
];

const causa_externa_producido = [
    { id: 1, nombre: "1 - Accidente" },
    { id: 2, nombre: "2 - Lesiones autoinfligidas" },
    { id: 3, nombre: "3 - Agresiones" },
    { id: 5, nombre: "5 - Se ignora" },
];

const causa_externa_lugar = [
    { id: 1, nombre: "1 - Domicilio" },
    { id: 2, nombre: "2 - Vía pública" },
    { id: 3, nombre: "3 - Lugar de trabajo" },
    { id: 4, nombre: "4 - Otro" },
];

const prod_gesta_condicion = [
    { id: 1, nombre: "1 - Nacido vivo" },
    { id: 2, nombre: "2 - Def. fetal (incluye abortos)" },
];

const prod_gesta_terminacion = [
    { id: 1, nombre: "1 - Vaginal" },
    { id: 2, nombre: "2 - Cesárea" },
];

const dengue_confirmacion = [
    { id: 1, nombre: "Elisa", toString: "Elisa" },
    { id: 2, nombre: "Nexo epidemiológico", toString: "nexo epidemiológico" },
    { id: 3, nombre: "PCR", toString: "PCR" },
    { id: 4, nombre: "Test rápido", toString: "test rápido" },
    { id: 99, nombre: "En estudio", toString: "sin confirmar" },
];
const dengue_serotipo = [
    { id: 1, nombre: "DEN-1", toString: "DEN1" },
    { id: 2, nombre: "DEN-2", toString: "DEN2" },
    { id: 3, nombre: "DEN-3", toString: "DEN3" },
    { id: 4, nombre: "DEN-4", toString: "DEN4" },
    { id: 99, nombre: "Sin serotipo", toString: "sin confirmar" },
];

const resultados_revision = [
    { id: 1, nombre: "Aprobado" },
    { id: 2, nombre: "Necesita correción" },
];
const resultados_revision_codificacion = [
    { id: 1, nombre: "Aprobado" },
    { id: 2, nombre: "Necesita correción del establecimiento" },
    { id: 3, nombre: "Necesita correción del codificador" },
];

const log_referencia = {
    CONSU_EXT: { id: 1, nombre: "Consultorio externo" },
    ESTABLECI: { id: 2, nombre: "Establecimiento" },
    UOXESTAB: { id: 3, nombre: "Unidad operativa por establecimiento" },
    SECTOR: { id: 4, nombre: "Sector" },
    SERVICIO: { id: 5, nombre: "Servicio" },
    SUBUNIDAD: { id: 6, nombre: "Subunidad" },
    P_M_INFANTIL: { id: 7, nombre: "P. Mat. Infantil" },
    ACT_AGEN_SANIT: { id: 8, nombre: "Act. Agente Sanitario" },
    PROD_MENSUAL: { id: 9, nombre: "Producción Mensual" },
    OBSTETRICIA: { id: 10, nombre: "Obstetricia" },
    USUARIO: { id: 11, nombre: "Usuario" },
    RECIB_DERIV: { id: 12, nombre: "Pacientes Recibidos y Derivados" },
    TRAB_SOCIAL: { id: 13, nombre: "Trabajo Social" },
    HOSPITALIZACION: { id: 14, nombre: "Hospitalización" },
    REC_SALUD: { id: 15, nombre: "Recursos de salud" },
    ENFERMERIA: { id: 16, nombre: "Prestaciones de Enfermería" },
};

const tieneInternacion = (p_tipo_establecimiento) => {
    return p_tipo_establecimiento <= 4;
};

const tipos_establecimiento_publico = [
    { id: 1, nombre: "HP-VIII" },
    { id: 3, nombre: "HIR-VI" },
    { id: 4, nombre: "HR-IV" },
    { id: 6, nombre: "HG-III" },
    { id: 7, nombre: "CS-IV" },
    { id: 8, nombre: "CS-III" },
    { id: 9, nombre: "CS-II" },
    { id: 10, nombre: "CS-I" },
    { id: 12, nombre: "OTROS" },
    { id: 15, nombre: "C.I.C." },
    { id: 16, nombre: "CESM-III" },
    { id: 19, nombre: "CED-III" },
    { id: 22, nombre: "CABIN-IV" },
    { id: 23, nombre: "CEH-IV" },
    { id: 24, nombre: "HO-IV" },
    { id: 25, nombre: "HP-VI-PED" },
    { id: 26, nombre: "LC-IV" },
    { id: 91, nombre: "PUBLICO OTRA PROV" },
];
const tipos_establecimiento_privado = [
    { id: 13, nombre: "PRIVADO CHACO" },
    { id: 92, nombre: "PRIVADO OTRA PROV" },
];

const tipos_establecimiento_global = [
    { id: "0", nombre: "Público", items: tipos_establecimiento_publico, },
    { id: "1", nombre: "Privado", items: tipos_establecimiento_privado, },
];

const region = [
    { id: 1, nombre: "Región I" },
    { id: 2, nombre: "Región II" },
    { id: 3, nombre: "Región III" },
    { id: 4, nombre: "Región IV" },
    //{ id: 5, nombre: "Región V" },
    { id: 51, nombre: "Región V - UDT 1 y 2" },
    { id: 53, nombre: "Región V - UDT 3 y 4" },
    { id: 6, nombre: "Región VI" },
    { id: 7, nombre: "Región VII" },
    { id: 8, nombre: "Región VIII" },
    { id: 9, nombre: "Otros" },
];
const anosDatos = (() => {
    let t_anos = [];
    for (var i = 2022; i <= new Date().getFullYear(); i++) {
        t_anos.push({ id: i, nombre: i });
    }
    return t_anos;
})();

export const Formatter = {
    recaptchaSiteKey, GOOGLE_MAPS_API_KEY,
    dateBdToUi,
    resultados_revision,
    log_referencia,
    numberToText,
    tieneInternacion,
    sexo, es_derivado, unidad_edad, tipos_establecimiento_global,
    region, genero, anosDatos, cobertura_medica,
    nivel_instruccion, situacion_laboral, tipo_egreso,
    causa_externa_producido, causa_externa_lugar,
    prod_gesta_condicion, prod_gesta_terminacion,
    dengue_confirmacion, dengue_serotipo,
    arrayDataToString, getArrayDataById,
    resultados_revision_codificacion, meses
}