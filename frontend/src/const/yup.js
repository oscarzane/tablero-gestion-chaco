/* eslint-disable no-template-curly-in-string */
import { setLocale } from 'yup';

export const setYupLocaleES = () => {
    setLocale({
        mixed: {//${path}
            default: 'Valor no válido',
            required: 'Campo obligatorio',
            oneOf: 'Debe ser uno de los siguientes: ${values}',
            notOneOf: 'No debe ser uno de los siguientes: ${values}',
            defined: 'Debe estar definido',
            notType: ({ type }) => {
                switch(type){
                    case 'number': return "Número incorrecto";
                    case 'date': return "Fecha incorrecta";
                    default: return "Formato " + type + " incorrecto";
                }
            },
            notNull: "Campo obligatorio",
        },
        string: {
            email: 'Formato incorrecto',
            min: 'Mínimo ${min} caracteres',
            max: 'Máximo ${max} caracteres',
        },
        number: {
            min: 'Debe ser mayor o igual a ${min}',
            max: 'Debe ser menor o igual a ${max}',
            lessThan: 'Debe ser menor a ${less}',
            moreThan: 'Debe ser mayor a ${more}',
            notEqual: 'Debe ser distinto de ${notEqual}',
            positive: 'Debe ser un positivo',
            negative: 'Debe ser negativo',
            integer: 'Debe ser entero',
            notType: 'Debe ser solo números'
        },
        date: {
            min: 'La fecha es menor a lo permitido',
            max: 'La fecha es mayor a lo permitido',
        },
        array: {
            min: 'Debes agregar al menos ${min}',
            max: 'Debes agregar ${max} como máximo',
        }
    });
}