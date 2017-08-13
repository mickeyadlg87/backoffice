package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.Parameter;
import com.redd.backoffice.bo.AccesoriesBO;
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
 * Servicios destinados a accesorios de los dispositivos
 *
 * @author aleal
 */
@RestController
public class AccesoriesController {

    @Autowired
    AccesoriesBO accesoryBo;

    @RequestMapping(value = "/backoffice/accesories/getAll", method = RequestMethod.GET)
    public List<Parameter> getListAccesories(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Parameter> result = new ArrayList<>();

        try {
            result = accesoryBo.getAllAccesoriesBack((String) param.get("realm"),
                    (String) param.get("sortBy"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/accesories/getByDeviceType", method = RequestMethod.GET)
    public List<Parameter> getAccesoryByDeviceType(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Parameter> result = new ArrayList<>();

        try {
            result = accesoryBo.getAccesoriesByDeviceType((String) param.get("realm"),
                    Integer.parseInt((String) param.get("deviceTypeId")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/accesories/updateForDeviceType", method = RequestMethod.POST)
    public Parameter updateAccesoryByDevice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramAccesorForDev = (Map) new HashMap<>((Map) param.get("accesorydevice")).get("content");

        Parameter response = new Parameter();
        response.put("result", false);
        try {
            int idDevType = (Integer) paramAccesorForDev.get("idDeviceType");
            List<HashMap> accesListForDev = (List) paramAccesorForDev.get("accesoryForDevice");
            response = accesoryBo.saveOrDeleteAccesoriesByDevice(idDevType, accesListForDev, (String) paramAccesorForDev.get("realm"));
            response.put("result", true);
            Logger.getRootLogger().info("UpdateAccesoryForDevice = " + response);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }

}
