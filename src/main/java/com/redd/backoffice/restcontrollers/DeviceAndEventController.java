package com.redd.backoffice.restcontrollers;

import cl.gps.drivers.objects.DeviceEvent;
import cl.tastets.life.objects.Event;
import cl.tastets.life.objects.backoffice.DeviceType;
import cl.tastets.life.objects.backoffice.SimCard;
import com.redd.backoffice.bo.DeviceEventBO;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author aleal
 */
@RestController
public class DeviceAndEventController {

    @Autowired
    DeviceEventBO deviceEventBo;

    @RequestMapping(value = "/backoffice/deviceType/getListDeviceType", method = RequestMethod.GET)
    public List<DeviceType> getListDeviceTypes(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<DeviceType> result = new ArrayList<>();

        try {
            result = deviceEventBo.getAllDeviceTypes((String) param.get("realm"),
                    (String) param.get("sortBy"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/event/getListEvents", method = RequestMethod.GET)
    public List<Event> getListEvents(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Event> result = new ArrayList<>();

        try {
            result = deviceEventBo.getAllEvents((String) param.get("realm"),
                    Boolean.parseBoolean((String) param.get("isVisible")),
                    (String) param.get("sortBy"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/event/getEventByDeviceType", method = RequestMethod.GET)
    public List<Event> getEventsByDeviceType(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Event> result = new ArrayList<>();

        try {
            result = deviceEventBo.getEventByDeviceType((String) param.get("realm"),
                    Integer.parseInt((String) param.get("deviceTypeId")),
                    Boolean.parseBoolean((String) param.get("onlyVisibleEvents")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/event/updateEventsForDevType", method = RequestMethod.POST)
    public Event updateEventByDevice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramEventForDev = (Map) new HashMap<>((Map) param.get("eventdevice")).get("content");

        Event response = new Event();
        response.put("result", false);
        try {
            int idDevType = (Integer) paramEventForDev.get("idDeviceType");
            List<HashMap> eventsListForDev = (List) paramEventForDev.get("eventForDevice");
            response = deviceEventBo.saveOrDeleteEventsByDevice(idDevType, eventsListForDev, (String) paramEventForDev.get("realm"));
            response.put("result", true);
            Logger.getRootLogger().info("UpdateEventForDevice = " + response);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/devices/getDeviceByRealm", method = RequestMethod.GET)
    public List<DeviceType> getDeviceList(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<DeviceType> result = new ArrayList<>();

        try {
            result = deviceEventBo.getAllDevicesPaginated((String) param.get("realm"));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
    
    @RequestMapping(value = "/backoffice/devices/updateSimCardDevice", method = RequestMethod.POST)
    public SimCard updateSimCardDevice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramDeviceSimCard = (Map) param.get("dispositivo");

        SimCard response = new SimCard();
        response.put("result", false);
        try {
            response = deviceEventBo.updateSimcardDevice(paramDeviceSimCard);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();;
        }
        return response;

    }
    
    /**
     * Edita el dispositivo
     * 
     * @param param
     * @param model
     * @param session
     * @return 
     */
    @RequestMapping(value = "/backoffice/devices/updateDeviceSelected", method = RequestMethod.POST)
    public DeviceType updateDeviceSelected(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramDevice = new HashMap<>((Map) param.get("dispositivo"));

        DeviceType response = new DeviceType();
        response.put("result", false);
        try {
            response = deviceEventBo.updateDeviceSelected(paramDevice);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/device/insertNewSimCardForDevice", method = RequestMethod.POST)
    public DeviceType insertSimCardForDevice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        
        Map<String, Object> paramNewSimCard = new HashMap<>((Map) param.get("dispositivo"));
        
        DeviceType response = new DeviceType();
        response.put("result", false);
        try{
            response = deviceEventBo.insertNewSimCardForDevice(paramNewSimCard);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/devices/getEventForValidate", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getEventForValidateList(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<HashMap<String, Object>> result = new ArrayList<>();

        try {
            result = deviceEventBo.getEventForValidate((String) param.get("realm"), (Integer) Integer.parseInt((String) param.get("deviceTypeId")));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
    
    @RequestMapping(value = "/backoffice/devices/getAccessoriesForValidate", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getAccessoriesForValidateList(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<HashMap<String, Object>> result = new ArrayList<>();

        try {
            result = deviceEventBo.getAccessoriesForValidate((String) param.get("realm"), (Integer) Integer.parseInt((String) param.get("deviceTypeId")));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
    
    /**
     * Obtiene todos los eventos de una unidad dentro de un periodo de tiempo
     * @param param
     * @param model
     * @param session
     * @return 
     */
    @RequestMapping(value = "/backoffice/devices/getEventsListByImei", method = RequestMethod.GET)
    public List<DeviceEvent> getEventsByImei(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<DeviceEvent> response = new ArrayList<>();
        
        try {
            response = deviceEventBo.getEventList((String) param.get("mid"),
                    Long.parseLong((String) param.get("from")),
                    Long.parseLong((String) param.get("to")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/devices/getProviderSimcard", method = RequestMethod.GET)
    public List<SimCard> getProvidersForSimCard(@RequestParam(value = "realm") String realm, Model model,
            HttpSession session) {

        List<SimCard> response = new ArrayList<>();

        try {
            response = deviceEventBo.getProviderSimcard(realm);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    /**
     * Valida si existen los eventos para certificar el dispositivo
     * @param param
     * @param model
     * @param session
     * @return 
     */
    @RequestMapping(value = "/backoffice/devices/validateEventForCertificate", method = RequestMethod.POST)
    public Event validateEventForCertificate(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        
        Event response = new Event();
        response.put("result", false);
        
        try {
            response = deviceEventBo.validateEvent(param);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "backoffice/devices/getAccessoriesInstalled", method = RequestMethod.GET)
    public DeviceType getAccessoriesInstalled(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        DeviceType result = new DeviceType();
        result.put("status", false);

        try {
            result = deviceEventBo.getAccessoriesInstalled((String) param.get("realm"), (String) param.get("imei"));
            result.put("status", true);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
            
    @RequestMapping(value = "backoffice/device/saveAccessoriesForDevice", method = RequestMethod.POST)
    public DeviceType saveAccessoryforDevice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramAccessory = (Map) param.get("dispositivo");

        DeviceType response = new DeviceType();
        response.put("result", false);
        try {
            response = deviceEventBo.insertAccessory(paramAccessory);
            response.put("result", true);
            Logger.getRootLogger().info("SaveAcceossory = " + response);

        } catch (Exception e) {
            e.printStackTrace();

        }
        return response;

    }
    
}
