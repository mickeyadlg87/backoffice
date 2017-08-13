package com.redd.backoffice.utils;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

/**
 *
 * @author aleal
 */
public class ReportUtils {

    public static SimpleDateFormat DATE_TO_STRING_FORMAT = new SimpleDateFormat("dd-MM-yyyy ss:mm:HH");

    /**
     * Metodo que retorna la plataforma normalizada para consulta en servicios
     *
     * @param realm Nombre de la plataforma
     * @return String con plataforma normalizada
     */
    public static String getNormalizadedRealm(String realm) {
        String newRealm = realm;

        if (realm.equals("entellite")) {
            newRealm = "entel";
        }
        return newRealm;
    }

    /**
     * Metodo que retorna la fecha en String
     *
     * @param milis Date en milis
     * @return String con la fecha calculada
     */
    public static String getStringDate(long milis) {
        Date fecha = new Date();
        fecha.setTime(milis);
        return DATE_TO_STRING_FORMAT.format(fecha);
    }

    /**
     * Metodo que retorna si un string es double
     *
     * @param obj
     * @return boolean si puede ser double o no
     */
    public static boolean isDouble(Object obj) {
        try {
            Double value = (Double) obj;
            return true;
        } catch (ClassCastException e) {
            return false;
        }
    }

    /**
     * Metodo que retorna si un string es int
     *
     * @param obj
     * @return boolean si puede ser int o no
     */
    public static boolean isInteger(Object obj) {
        try {
            int value = (int) obj;
            return true;
        } catch (ClassCastException e) {
            return false;
        }
    }
    
    /**
     * metodo que devuelve el estado de un movil de acuerdo a su fecha de ultima actividad
     * y a su velocidad
     * @param lastStateDate
     * @param lastStateSpeed
     * @return 
     */
    public static String unitStateImage(Long lastStateDate, Double lastStateSpeed) {
        
        LocalDateTime now = LocalDateTime.now();
        Instant ins = Instant.ofEpochMilli(lastStateDate);
        LocalDateTime laststate = LocalDateTime.ofInstant(ins, ZoneId.systemDefault());
        String srcImage = "notfound";
                
        // activo (fecha de ultima actividad es menor a 8 horas)
        if (now.isAfter(laststate) && now.minusHours(8).isBefore(laststate)) {            
            srcImage = lastStateSpeed > 5 ? "backoffice/resources/images/truck_blue.png" : "backoffice/resources/images/truck_green.png";
        }
        // amarillo - inactivo (fecha de ultima actividad es mayor a 8 horas pero menor a 24)
        else if (now.minusHours(8).isAfter(laststate) && now.minusHours(24).isBefore(laststate)) {
            srcImage = "backoffice/resources/images/truck_yellow.png";
        } 
        // rojo - inactivo (fecha de ultima actividad es mayor a 24 horas)
        else if (now.minusHours(24).isAfter(laststate)) {
            srcImage = "backoffice/resources/images/truck_red.png";
        }

        return srcImage;
    }

}
