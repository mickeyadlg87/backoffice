package com.redd.backoffice.bo;

import cl.gps.drivers.enums.EventosEnum;
import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Event;
import cl.tastets.life.objects.Fleet;
import cl.tastets.life.objects.Parameter;
import cl.tastets.life.objects.Profile;
import cl.tastets.life.objects.RequestListMids;
import cl.tastets.life.objects.Vehicle;
import cl.tastets.life.objects.utils.Paginated;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.ReportUtils;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author fgodoy
 */
@RestController
public class UnitBO {

    private static final Logger logger = Logger.getLogger("UnitBo");
    private final StringBuilder sb = new StringBuilder();

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;
    

    public List<HashMap<String, Object>> getAllUnitsByCompany(String realm, Integer companyId, Optional<String> limit, Optional<String> offset) {
        
        BasicEntity request = new BasicEntity();
        int limite = limit.isPresent() ? Integer.parseInt(limit.get()) : propertiesUtils.getLimitUnitForGet();
        int off = offset.isPresent() ? Integer.parseInt(offset.get()) : propertiesUtils.getOffsetUnitForGet();
        request.put("paginated", Paginated.from().put("limit", limite).put("offset", off));
        request.put("filter", new Vehicle().put("filter", Arrays.asList(new Vehicle().put("validate", true))).put("sort", "lastActivityDate"));
        logger.info(propertiesUtils.getUrlServiceVehicle() + "getAllByCompany?realm=" + realm + "&companyId=" + companyId + "&lastState=true" + request);
        List<HashMap<String, Object>> rawList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceVehicle() + "getAllByCompany?realm=" + realm + "&companyId=" + companyId + "&lastState=true", request);

        rawList.stream().forEach((vehicles) -> {
            HashMap lastState = (HashMap) vehicles.get("lastState");
            if (lastState != null && !lastState.isEmpty() && lastState.get("_t") != null && !(lastState.get("_t") instanceof Integer) && lastState.get("speed") != null) {
                lastState.put("stateImg", ReportUtils.unitStateImage((Long) lastState.get("_t"), (Double) lastState.get("speed")));
                vehicles.put("lastState", lastState);
            }
        });
        
        return rawList;
    }
    
    public List<HashMap<String, Object>> getAllUnitsByCompanyForRatify(String realm, Integer companyId) {

        BasicEntity request = new BasicEntity();
        
        request.put("paginated", Paginated.from().put("limit", propertiesUtils.getLimitUnitForGet()).put("offset", propertiesUtils.getOffsetUnitForGet()));
        request.put("filter", new Vehicle().put("sort", "lastActivityDate"));
        logger.info(propertiesUtils.getUrlServiceVehicle() + "getAllByCompany?realm=" + realm + "&companyId=" + companyId + "&lastState=false&revertUnsuscribe=true" + request);
        List<HashMap<String, Object>> listUnsiscribe = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceVehicle() + "getAllByCompany?realm=" + realm + "&companyId=" + companyId + "&lastState=false&revertUnsuscribe=true", request);

        return listUnsiscribe;
    }

    public Profile updateUnit(Map<String, Object> param) {

        Profile unitToUpdate = new Profile();
        Profile responseProfile = new Profile();

        unitToUpdate.putAll((Map) param.get("unidad"));
        String realm = (String) param.get("realm");
        unitToUpdate.put("realm", realm);

        logger.info(propertiesUtils.getUrlServiceVehicle() + "update" + unitToUpdate);
        responseProfile.putAll(webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceVehicle() + "update", unitToUpdate));
        
        // agrega el movil a la flota default de la empresa seleccionada
        if (responseProfile.get("addDefaultFleet") != null) {
            responseProfile.putAll(insertUnitIntoDefaultFleet(realm, responseProfile.getInteger("companyId"), responseProfile.getInteger("id")));
        }
        return responseProfile;
        
    }

    public Profile updateUnitForUnsubscribe(Map<String, Object> param) {
        
        Profile unitToUpdate = new Profile();
        unitToUpdate.putAll(param);
        logger.info(propertiesUtils.getUrlServiceVehicle() + "update" + unitToUpdate);
        
        return (Profile) webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceVehicle() + "update", unitToUpdate);
    }

    public Vehicle getUnitByMid(String realm, String imei) {

        RequestListMids req = new RequestListMids(realm, Boolean.TRUE, Arrays.asList(new Vehicle().put("_m", imei)));

        Vehicle unitLastState = new Vehicle();
        sb.setLength(0);
        sb.append(propertiesUtils.getUrlServiceVehicle()).append("getLastStateByMids");
        logger.info(sb.toString() + " " + req.getMids());
        unitLastState.putAll((Map) webServiceRequest.getWSRequestObjectPOST(sb.toString(), req).get(imei));

        List<Event> listaEve = new ArrayList<>();
        Vehicle vehicleToReturn = new Vehicle();

        unitLastState.forEach((key, value) -> {
            try {
                int keyEvento = Integer.parseInt(key);
                String nombreEvento = EventosEnum.getNameFromValue((long) keyEvento);
                Event parsEvento = new Event().put("eventId", keyEvento).put("time", value).put("eventName", nombreEvento);
                listaEve.add(parsEvento);
            } catch (Exception e) {
                if ("realms".equals(key)) {
                    HashMap realms = new HashMap((Map) value);
                    realms.forEach((keyRealm, valueRealm) -> {
                        BasicEntity metadataMultiPlataforma = new BasicEntity((Map) valueRealm);
                        if (keyRealm.equals("rslite")) {
                            vehicleToReturn.put("rslite", metadataMultiPlataforma);
                        } else if (keyRealm.equals("entel")) {
                            vehicleToReturn.put("entel", metadataMultiPlataforma);
                        } else if (keyRealm.equals("rastreosat")) {
                            vehicleToReturn.put("rastreosat", metadataMultiPlataforma);
                        }
                    });
                } else {
                    vehicleToReturn.put(key, value);
                }
            }
        });
        vehicleToReturn.put("listaEventos", listaEve);

        HashMap lastPosition = (HashMap) vehicleToReturn.get("lastPosition");

        if (lastPosition != null && !lastPosition.isEmpty() && lastPosition.get("date") != null && !(lastPosition.get("date") instanceof Integer) && lastPosition.get("speed") != null) {
            lastPosition.put("stateImg", ReportUtils.unitStateImage((Long) lastPosition.get("date"), (Double) lastPosition.get("speed")));
            vehicleToReturn.put("lastPosition", lastPosition);
        }
        return vehicleToReturn;
    }
    
    public List<Parameter> getStatesByCodeName(String realm, String codeName) {
        BasicEntity request = new BasicEntity();
        String url = propertiesUtils.getUrlParamService() + "parameter/getStatesByCodeName?realm=" + realm + "&codeName=" + codeName;
        logger.info(url);
        return webServiceRequest.getWSResponsePOSTGenericList(url, request, Parameter[].class);
    }

    public List<HashMap<String, Object>> getUnitForCertificate(String realm) {

        BasicEntity request = new BasicEntity();

        int limit = propertiesUtils.getLimitUnitForGet();
        int offset = propertiesUtils.getOffsetUnitForGet();
        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));
        request.put("filter", new Vehicle().put("filter", Arrays.asList(new Vehicle().put("validate", false))).put("sort", "lastActivityDate"));

        logger.info(propertiesUtils.getUrlServiceVehicle() + "getByRealm?realm=" + realm + "&forCertificate=true" + request);
        List<HashMap<String, Object>> unitListForCertificated = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceVehicle() + "getByRealm?realm=" + realm + "&forCertificate=true", request);

        return unitListForCertificated;
    }

    public List<HashMap<String, Object>> getAccessoriesAndEventForValidate(String realm, Integer deviceTypeId, String mid) {

        List<HashMap<String, Object>> validateList;

        logger.info(propertiesUtils.getUrlServiceEvent() + "getEventsForCertificateByMid?realm=" + realm + "&deviceTypeId=" + deviceTypeId + "&mid=" + mid);
        validateList = (List<HashMap<String, Object>>) webServiceRequest.getWSResponseGET(propertiesUtils.getUrlServiceEvent() + "getEventsForCertificateByMid?realm=" + realm + "&deviceTypeId=" + deviceTypeId + "&mid=" + mid, new ArrayList<Map>());        
        
        return validateList;
    }
    
    public Vehicle insertInfoCert(Map<String, Object> param) {
        
        Vehicle infoToSave = new Vehicle();
        infoToSave.putAll((Map) param.get("unidad"));
        String realm = (String) param.get("realm");
        infoToSave.put("realm", realm);
        
        logger.info(propertiesUtils.getUrlServiceEvent() + "saveUnitCertified" + infoToSave);
        Vehicle response = new Vehicle();
        response.putAll(webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceEvent() + "saveUnitCertified", infoToSave));
        
        return response;
    }
    
    public Fleet insertUnitIntoDefaultFleet(String realm, Integer companyId, Integer unitId) {

        BasicEntity request = new BasicEntity();
        Fleet defaultFleet = new Fleet();

        request.put("paginated", Paginated.from());
        request.put("filter", new Vehicle().put("filter", new ArrayList<>())
                .put("userProfile", "ADMIN")
                .put("companyId", companyId));

        // se consultan todas las flotas de la empresa suministrada
        String urlmetaFleet = propertiesUtils.getUrlServiceVehicle() + "fleet/getMetadataByUser?realm=" + realm;
        logger.info(urlmetaFleet);
        List<Fleet> allFleets = webServiceRequest.getWSResponsePOSTGenericList(urlmetaFleet, request, Fleet[].class);

        // encuentra la flota default
        allFleets.stream().filter((f) -> (f.get("defaultFleet") != null && f.getInteger("defaultFleet") == 1)).forEach((f) -> {
            defaultFleet.putAll(f);
        });

        // si se encuentra la flota default, se realiza el update de dicha flota 
        // incluyendo el movil a certificar
        if (defaultFleet.get("id") != null) {
            defaultFleet.put("vehicles", Arrays.asList(new Vehicle().put("id", unitId)))
                    .put("unitCertification", true);

            logger.info(propertiesUtils.getUrlServiceVehicle() + "fleet/update" + defaultFleet);
            webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceVehicle() + "fleet/update", defaultFleet);
        }

        return defaultFleet;

    }

}
