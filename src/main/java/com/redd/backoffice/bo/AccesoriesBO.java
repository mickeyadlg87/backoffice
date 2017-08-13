package com.redd.backoffice.bo;

import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Parameter;
import cl.tastets.life.objects.utils.Paginated;
import cl.tastets.life.objects.utils.QueryFilter;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.annotation.PostConstruct;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author aleal
 */
@Component
public class AccesoriesBO {

    private static final Logger logger = Logger.getLogger("AccesoryBO");

    private int limitFromProp;
    private int offsetFromProp;

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;

    @PostConstruct
    public void initValues() {
        limitFromProp = propertiesUtils.getLimitForGet();
        offsetFromProp = propertiesUtils.getOffsetForGet();
    }

    public List<Parameter> getAllAccesoriesBack(String realm, String sortBy) {

        List<Parameter> accesorList = new ArrayList<>();
        BasicEntity request = new BasicEntity();

        request.put("paginated", Paginated.from().put("limit", limitFromProp).put("offset", offsetFromProp));
        if (sortBy != null && !"".equals(sortBy)) {
            request.put("filter", QueryFilter.from().put("sort", sortBy));
        }

        logger.info("accesories/getAll?realm=" + realm + request);
        List<HashMap<String, Object>> rawList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "accesories/getAll?realm=" + realm, request);
        rawList.stream().map((m) -> {
            Parameter dt = new Parameter();
            dt.putAll(m);
            return dt;
        }).forEach((devType) -> {
            accesorList.add(devType);
        });

        return accesorList;

    }

    public List<Parameter> getAccesoriesByDeviceType(String realm, Integer deviceTypeId) {

        List<Parameter> accesoriesByDeviceType = new ArrayList<>();
        // get all accesories
        List<Parameter> allAccesory = getAllAccesoriesBack(realm, null);
        // get events by device type
        BasicEntity request = new BasicEntity();

        request.put("paginated", Paginated.from().put("limit", limitFromProp).put("offset", offsetFromProp));
        request.put("filter", new Parameter());
        logger.info("accesories/getByDeviceTypeId?realm=" + realm + "&deviceTypeId=" + deviceTypeId + request);
        List<HashMap<String, Object>> rawAccessoryList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceDevices() + "accesories/getByDeviceTypeId?realm=" + realm + "&deviceTypeId=" + deviceTypeId, request);

        allAccesory.stream().map((e) -> {
            e.put("enable", false);
            return e;
        }).forEach((e) -> {
            rawAccessoryList.stream().filter((HashMap enableAcc) -> (enableAcc.get("accesoryId").equals(e.get("id")))).findFirst().ifPresent((HashMap trueAccesor) -> {
                e.put("enable", true);
            });
            accesoriesByDeviceType.add(e);
        });

        return accesoriesByDeviceType;

    }

    public Parameter saveOrDeleteAccesoriesByDevice(Integer deviceTpe, List<HashMap> accesForDeviceList, String realm) {

        int addEvent = 0;
        int deleteEvent = 0;
        Parameter accesorioForEachDevice = new Parameter();
        accesorioForEachDevice.put("realm", realm).put("deviceTypeId", deviceTpe);
        for (HashMap accesory : accesForDeviceList) {
            try {
                accesorioForEachDevice.put("accesoryId", accesory.get("id"));
                if ((Boolean) accesory.get("enable")) {
                    addEvent++;
                    webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceDevices() + "accesoryDeviceType/save", accesorioForEachDevice);
                } else {
                    deleteEvent++;
                    webServiceRequest.getWsResponseDelete(propertiesUtils.getUrlServiceDevices() + "accesoryDeviceType/delete/{realm}/{accesoryId}/{deviceTypeId}", accesorioForEachDevice);
                }

            } catch (Exception e) {
                logger.debug(e.getMessage());
            }
        }
        accesorioForEachDevice.put("addEvent", addEvent).put("deleteEvent", deleteEvent);
        return accesorioForEachDevice;

    }

}
