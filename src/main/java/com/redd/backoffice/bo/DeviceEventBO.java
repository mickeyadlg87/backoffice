package com.redd.backoffice.bo;

import cl.gps.drivers.enums.EventosEnum;
import cl.gps.drivers.objects.DeviceEvent;
import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Event;
import cl.tastets.life.objects.Parameter;
import cl.tastets.life.objects.backoffice.DeviceType;
import cl.tastets.life.objects.backoffice.SimCard;
import cl.tastets.life.objects.utils.Paginated;
import cl.tastets.life.objects.utils.QueryFilter;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author aleal
 */
@Component
public class DeviceEventBO {

    private static final Logger logger = Logger.getLogger("DeviceEventBO");

    private int limitFromProp;
    private int offsetFromProp;

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;

    @PostConstruct
    public void intValues() {
        limitFromProp = propertiesUtils.getLimitDeviceForGet();
        offsetFromProp = propertiesUtils.getOffsetDeviceForGet();
    }

    public List<DeviceType> getAllDeviceTypes(String realm, String sortBy) {

        List<DeviceType> deviceTypeList = new ArrayList<>();
        BasicEntity request = new BasicEntity();

        int limit = propertiesUtils.getLimitForGet();
        int offset = propertiesUtils.getOffsetForGet();

        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));
        if (sortBy != null && !"".equals(sortBy)) {
            request.put("filter", QueryFilter.from().put("sort", sortBy));
        }

        logger.info("deviceType/getAll?realm=" + realm + request);
        List<HashMap<String, Object>> rawList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "type/getAll?realm=" + realm, request);
        rawList.stream().map((m) -> {
            DeviceType dt = new DeviceType();
            dt.putAll(m);
            return dt;
        }).forEach((devType) -> {
            deviceTypeList.add(devType);
        });

        return deviceTypeList;

    }

    public List<Event> getAllEvents(String realm, Boolean isVisible, String sortBy) {

        List<Event> eventList = new ArrayList<>();
        BasicEntity request = new BasicEntity();

        int limit = propertiesUtils.getLimitForGet();
        int offset = propertiesUtils.getOffsetForGet();

        boolean sorteable = (sortBy != null && !"".equals(sortBy));
        boolean visibleFilter = (isVisible != null && isVisible);

        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));

        if (sorteable && visibleFilter) {
            QueryFilter query = QueryFilter.from();
            query.getList("filter").add(new Event().put("isVisible", visibleFilter));
            query.put("sort", sortBy);
            request.put("filter", query);
        } else if (!sorteable && visibleFilter) {
            QueryFilter query = QueryFilter.from();
            query.getList("filter").add(new Event().put("isVisible", visibleFilter));
            request.put("filter", query);
        } else if (sorteable && !visibleFilter) {
            request.put("filter", QueryFilter.from().put("sort", sortBy));
        }

        logger.info("events/getAll?realm=" + realm + request);
        List<HashMap<String, Object>> rawList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceEvent() + "getAll?realm=" + realm, request);
        rawList.stream().map((m) -> {
            Event e = new Event();
            e.putAll(m);
            return e;
        }).forEach((ev) -> {
            eventList.add(ev);
        });

        return eventList;

    }

    public List<Event> getEventByDeviceType(String realm, Integer deviceTypeId, Boolean isVisible) {

        List<Event> eventListByDeviceType = new ArrayList<>();
        // get all events
        List<Event> allEvents = getAllEvents(realm, isVisible, null);
        // get events by device type
        BasicEntity request = new BasicEntity();
        int limit = propertiesUtils.getLimitForGet();
        int offset = propertiesUtils.getOffsetForGet();
        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));
        request.put("filter", new Event());
        logger.info("type/getEventsByTypeId?realm=" + realm + "&deviceTypeId=" + deviceTypeId + request);
        List<HashMap<String, Object>> rawEventList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "type/getEventsByTypeId?realm=" + realm + "&deviceTypeId=" + deviceTypeId, request);
        List<HashMap<String, Object>> rawEventCertificate = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "type/getEventsForCertificate?realm=" + realm + "&deviceTypeId=" + deviceTypeId, request);

        allEvents.stream().map((e) -> {
            e.put("enablePlataform", false);
            e.put("enableCertificate", false);
            return e;
        }).forEach((e) -> {
            rawEventList.stream().filter((HashMap enableEvent) -> (enableEvent.get("eventId").equals(e.get("id")))).findFirst().ifPresent((HashMap trueEve) -> {
                e.put("enablePlataform", true);
            });
            rawEventCertificate.stream().filter((HashMap enableEventCert) -> (enableEventCert.get("eventId").equals(e.get("id")))).findFirst().ifPresent((HashMap trueEve) -> {
                e.put("enableCertificate", true);
            });
            eventListByDeviceType.add(e);
        });

//        for (Event event : allEvents) {
//            event.put("enable", false);
//            for (HashMap eventEnable : rawEventList) {
//                if (eventEnable.get("eventId").equals(event.get("id"))) {
//                    event.put("enable", true);
//                    break;
//                }
//            }
//            eventListByDeviceType.add(event);
//        }
        return eventListByDeviceType;

    }

    public Event saveOrDeleteEventsByDevice(Integer deviceTpe, List<HashMap> evForDeviceList, String realm) throws Exception {

        int addEvent = 0;
        int deleteEvent = 0;
        boolean eventPlataform;
        boolean eventCertificate;
        Event eventForEachDevice = new Event();
        eventForEachDevice.put("realm", realm).put("deviceTypeId", deviceTpe);
        List<Event> deleteCert = new ArrayList<>();
        List<Event> addCert = new ArrayList<>();
        List<Event> deleteEventByDev = new ArrayList<>();
        List<Event> addEventByDev = new ArrayList<>();

        for (HashMap event : evForDeviceList) {
            eventForEachDevice.put("eventId", event.get("id"));
            eventPlataform = (Boolean) event.get("enablePlataform");
            eventCertificate = (Boolean) event.get("enableCertificate");

            Event eplat = new Event();
            eplat.putAll(eventForEachDevice);
            if (eventPlataform) {
                addEventByDev.add(eplat);
            } else {
                deleteEventByDev.add(eplat);
            }

            Event eCert = new Event();
            eCert.putAll(eventForEachDevice);
            if (eventCertificate) {
                eCert.put("certificateEvent", true);
                addCert.add(eCert);
            } else {
                deleteCert.add(eCert);
            }

        }
        
        // Eventos para certificar dispositivo (agregar)
        for (Event eCertAdd : addCert) {
            try {
                webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceDevices() + "eventCertificate/save", eCertAdd);
                addEvent++;
            } catch (Exception e) {
                logger.info(e.getMessage());
            }
        }
        // Eventos para certificar dispositivo (eliminar)
        for (Event eCertDel : deleteCert) {
            try {
                webServiceRequest.getWsResponseDelete(propertiesUtils.getUrlServiceDevices() + "eventCertificate/delete/{realm}/{eventId}/{deviceTypeId}", eCertDel);
                deleteEvent++;
            } catch (Exception e) {
                logger.info(e.getMessage());
            }
        }
        // Eventos para vincular dispositivo (agregar)
        for (Event eByDevAdd : addEventByDev) {
            try {
                webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceDevices() + "eventType/save", eByDevAdd);
                addEvent++;
            } catch (Exception e) {
                logger.info(e.getMessage());
            }
        }
        // Eventos para vincular dispositivo (eliminar)
        for (Event eByDevDel : deleteEventByDev) {
            try {
                webServiceRequest.getWsResponseDelete(propertiesUtils.getUrlServiceDevices() + "eventType/delete/{realm}/{eventId}/{deviceTypeId}", eByDevDel);
                deleteEvent++;
            } catch (Exception e) {
                logger.info(e.getMessage());
            }
        }    
        
        eventForEachDevice.put("addEvent", addEvent).put("deleteEvent", deleteEvent);
        return eventForEachDevice;

    }

    
    public List<DeviceType> getAllDevicesPaginated(String realm) {

        List<DeviceType> devicesList = new ArrayList<>();
        // cantidad de dispositivos que se traen por peticion al servicio
        int groupSize = 100;

        logger.info("Thread execution...");
//        List<HashMap<String, Object>> firstGps = (List<HashMap<String, Object>>) webServiceRequest.getWSResponseWithFinalRsGET(propertiesUtils.getUrlServiceCompany() + "gps/getAll?realm=" + realm + "&simcard=true&lastState=false&limit=1&offset=0", new ArrayList<>());
//        int totalDevices = firstGps != null ? (int) firstGps.get(0).get("total") : 0;
        int totalDevices = limitFromProp;
        List<Integer> paginado = new ArrayList<>();
        for (int i = 0; i < totalDevices; i += groupSize) {
            paginado.add(i);
        }

        List<List<Map>> objetos = paginado.parallelStream().map((offset) -> {
            return (List<Map>) webServiceRequest.getWSResponseWithFinalRsGET(propertiesUtils.getUrlServiceCompany() + "gps/getAll?realm=" + realm + "&simcard=true&lastState=false&limit=" + groupSize + "&offset=" + offset, new ArrayList<>());
        }).sorted((List<Map> devices1, List<Map> devices2) -> {
            Long creationDate1 = (Long) devices1.get(0).get("creationDate");
            Long creationDate2 = (Long) devices2.get(0).get("creationDate");
            return creationDate1.compareTo(creationDate2);
        }).collect(Collectors.toList());
                        
        objetos.stream().forEach((listas) -> {
            listas.stream().forEach((dispositivos) -> {
                DeviceType d = new DeviceType();
                d.putAll(dispositivos);
                devicesList.add(d);
            });
        });
        
        logger.info(propertiesUtils.getUrlServiceCompany() + "gps/getAll?realm=" + realm + "&simcard=true&lastState=false&limit=" + limitFromProp + "&offset=" + offsetFromProp);
        
        return devicesList;
    }

    public SimCard updateSimcardDevice(Map<String, Object> param) {

        SimCard simcardToUpdate = new SimCard();

        simcardToUpdate.putAll((Map) param.get("dispositivo"));
        String realm = (String) param.get("realm");
        simcardToUpdate.put("realm", realm);

        logger.info(propertiesUtils.getUrlServiceCompany() + "gps/simcard/update" + simcardToUpdate);

        return (SimCard) webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceCompany() + "gps/simcard/update", simcardToUpdate);

    }

    /**
     * trae los provedores de simcard segun realm
     * @param realm
     * @return lista de proveedores
     */
    public List<SimCard> getProviderSimcard(String realm) {
        BasicEntity request = new BasicEntity();
        String url = propertiesUtils.getUrlParamService() + "simcard/getProviders?realm=" + realm;
        logger.info(url);
        return webServiceRequest.getWSResponsePOSTGenericList(url, request, SimCard[].class);
    }

    public DeviceType updateDeviceSelected(Map<String, Object> param) {

        DeviceType deviceToUpdate = new DeviceType();

        deviceToUpdate.putAll((Map) param.get("dispositivo"));
        String realm = (String) param.get("realm");
        deviceToUpdate.put("realm", realm);

        logger.info(propertiesUtils.getUrlServiceCompany() + "gps/update" + deviceToUpdate);

        return (DeviceType) webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceCompany() + "gps/update", deviceToUpdate);
    }

    public DeviceType insertNewSimCardForDevice(Map<String, Object> param) {

        DeviceType simcardToInsert = new DeviceType();

        simcardToInsert.putAll((Map) param.get("dispositivo"));
        String realm = (String) param.get("realm");
        simcardToInsert.put("realm", realm);

        logger.info(propertiesUtils.getUrlServiceCompany() + "gps/simcard/save" + simcardToInsert);
        webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceCompany() + "gps/simcard/save", simcardToInsert);

        return simcardToInsert;
    }

    public List<HashMap<String, Object>> getEventForValidate(String realm, Integer deviceType) {

        List<HashMap<String, Object>> eventForValidateList;
        BasicEntity request = new BasicEntity();

        request.put("paginated", new Parameter());
        request.put("filter", new Parameter());

        logger.info(propertiesUtils.getUrlServiceDevices() + "type/getEventsForCertificate?realm=" + realm + "&deviceTypeId=" + deviceType + request);
        eventForValidateList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "type/getEventsForCertificate?realm=" + realm + "&deviceTypeId=" + deviceType, request);

        return eventForValidateList;
    }
    
    public List<HashMap<String, Object>> getAccessoriesForValidate(String realm, Integer deviceType) {

        List<HashMap<String, Object>> accessoriesForValidateList;
        BasicEntity request = new BasicEntity();

        request.put("paginated", new Parameter());
        request.put("filter", new Parameter());

        logger.info(propertiesUtils.getUrlServiceDevices() + "accesories/getByDeviceTypeId?realm=" + realm + "&deviceTypeId=" + deviceType + request);
        accessoriesForValidateList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "accesories/getByDeviceTypeId?realm=" + realm + "&deviceTypeId=" + deviceType, request);

        return accessoriesForValidateList;
    }
    
    public List<DeviceEvent> getEventList(String mid, Long from, Long to) {

        HashMap<String, Object> parametros = new HashMap<>();
        parametros.put("mids", mid);
        parametros.put("from", from);
        parametros.put("to", to);
        parametros.put("eids", new ArrayList<>());
        logger.info(propertiesUtils.getUrlServiceHistory() + "/deviceEvent/history/queryFilteredRangeStream" + parametros);
        List<DeviceEvent> eventosGenerados = webServiceRequest.getEventsFromHistory(propertiesUtils.getUrlServiceHistory(), parametros);
        
        // para enviar el nombre de evento hago uso de un atributo del deviceEvent llamado callId
        eventosGenerados.stream().forEach((dev) -> {
            String nombreEvento = EventosEnum.getNameFromValue(dev.getEventId());
            dev.setCallID(nombreEvento);
        });
        
        return eventosGenerados;
    }

    public Event validateEvent(Map<String, Object> paramValidateEvent) {

        Event validateEvent = new Event();
        ArrayList<String> idEventosList = new ArrayList<>();
        ArrayList<Event> respuestaEventosOk = new ArrayList<>();

        Map<String, Object> content = (Map) new HashMap<>((Map) paramValidateEvent.get("dispositivo")).get("contentCertEvent");
        List<Map> listaEventos = (List) content.get("arrayEvent");
        String mid = (String) ((Map) content.get("mid")).get("deviceImei");

        listaEventos.stream().forEach((eve) -> {
            idEventosList.add(Integer.toString((Integer) eve.get("eventId")));
        });

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
//        idEventosList.add("12");

        HashMap<String, Object> parametros = new HashMap<>();
//        parametros.put("mids", "860599001203587");
        parametros.put("mids", mid);
        parametros.put("from", yesterday.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        parametros.put("to", now.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        parametros.put("eids", idEventosList);

        logger.info(propertiesUtils.getUrlServiceHistory() + "/deviceEvent/history/queryFilteredRangeStream" + parametros);
        List<DeviceEvent> eventosGenerados = webServiceRequest.getEventsFromHistory(propertiesUtils.getUrlServiceHistory(), parametros);
        List<DeviceEvent> eventosGeneradosSinRepetir = new ArrayList<>();
        // se define un tree set para almacenar los eventos sin duplicados, se define como regla para el comparator,
        // que los eventos tengan el mismo event id
        Set<DeviceEvent> eventosTreeSet = new TreeSet<>((DeviceEvent dev1, DeviceEvent dev2) -> dev1.getEventId().compareTo(dev2.getEventId()));

        // se recorre la lista pura de eventos, y se inserta en una nueva lista de eventos una unica copia de eventos 
        // q ya ocurrieron durante el lapso de tiempo determinado
        eventosGenerados.stream().filter((devEv) -> (eventosTreeSet.add(devEv))).forEach((devEv) -> {
            eventosGeneradosSinRepetir.add(devEv);
        });

        // la lista de eventos sin repetidos se recorre encontrando eventos que coincidan con los eventos suministrados
        // para lograr la certificacion
        eventosGeneradosSinRepetir.stream().forEach((evento) -> {
            idEventosList.stream().filter((idEvCert) -> (idEvCert.equals(Long.toString(evento.getEventId())))).forEach((eventFiltered) -> {
                respuestaEventosOk.add(new Event().put("foundedEventId", Integer.parseInt(eventFiltered)));
            });
        });

        validateEvent.put("arrayEventFounded", respuestaEventosOk);
        return validateEvent.put("result", respuestaEventosOk.size() == idEventosList.size());
    }
    
    public DeviceType getAccessoriesInstalled(String realm, String imei) {

        DeviceType accessory = new DeviceType();

        logger.info(propertiesUtils.getUrlServiceAccessories() + "getInstalledByMid?realm=" + realm + "&mid=" + imei);
        accessory = (DeviceType) webServiceRequest.getWSResponseGET(propertiesUtils.getUrlServiceAccessories() + "getInstalledByMid?realm=" + realm + "&mid=" + imei, accessory);
        
        return accessory;
    }
    
    public DeviceType insertAccessory(Map<String, Object> param) {

        DeviceType accessoryToSave = new DeviceType();
        accessoryToSave.putAll((Map) param.get("dispositivo"));
        String realm = (String) param.get("realm");
        accessoryToSave.put("realm", realm);

        logger.info(propertiesUtils.getUrlServiceAccessories()+ "saveByDevice" + accessoryToSave);

        DeviceType response = new DeviceType();
        response.putAll(webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceAccessories() + "saveByDevice", accessoryToSave));
        
        return response;

    } 
}
