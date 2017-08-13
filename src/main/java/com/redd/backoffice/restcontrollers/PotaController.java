package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.Parameter;
import com.redd.backoffice.bo.PotaBO;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Servicio para el manejo de comandos por aire (POTA)
 *
 * @author aleal
 */
@RestController
public class PotaController {
    
    @Autowired
    PotaBO potaCommandBo;

    @RequestMapping(value = "/backoffice/pota/getListPota", method = RequestMethod.GET)
    public List<Parameter> getPotaCommandsList(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Parameter> result = new ArrayList<>();

        try {
            result = potaCommandBo.getCommandTypes((String) param.get("realm"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    
    @RequestMapping(value = "/backoffice/pota/getHistoryPotaByImei", method = RequestMethod.GET)
    public List<Parameter> getHistoryPotaByMid(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Parameter> result = new ArrayList<>();

        try {
            result = potaCommandBo.getHistoryforImei((String) param.get("realm"), (String) param.get("modemId"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }


    @RequestMapping(value = "/backoffice/pota/getPotaByType", method = RequestMethod.GET)
    public Parameter getPotaObjectByDeviceType(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        Parameter result = new Parameter();
        result.put("status", false);

        try {
            result = potaCommandBo.getObjectPota((String) param.get("realm"),
                                            Integer.parseInt((String) param.get("deviceTypeId")),
                                            (String) param.get("codeType"));
            result.put("status", true);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
    
    @RequestMapping(value = "/backoffice/pota/sendPotaCommand", method = RequestMethod.POST)
    public Parameter sendingPotaCommand(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Parameter response = new Parameter();
        response.put("result", false);

        try {
            response = potaCommandBo.executePotaCommand(param);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/pota/sendPotaCommandWithFilter", method = RequestMethod.POST)
    public Parameter sendPotaCommandFilter(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        
        Parameter response = new Parameter();
        response.put("result", false);
        try {
            response = potaCommandBo.executePotaCommandWithFilter(param);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }

}
