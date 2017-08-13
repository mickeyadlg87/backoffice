package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.Parameter;
import cl.tastets.life.objects.Profile;
import cl.tastets.life.objects.Vehicle;
import com.redd.backoffice.bo.UnitBO;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author fgodoy
 */
@RestController
public class UnitController {
    
    @Autowired
    UnitBO unitBo;
    
    @RequestMapping(value = "/backoffice/units/getListUnitsByCompany", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getListUnits(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        
        List<HashMap<String, Object>> result = new ArrayList<>();
        
        try {
            result = unitBo.getAllUnitsByCompany((String) param.get("realm"),
                    Integer.parseInt((String) param.get("companyId")),
                    Optional.ofNullable((String) param.get("limit")),
                    Optional.ofNullable((String) param.get("offset")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/units/getListUnitsByCompanyForRatify", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getListUnitsForRatify(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        
        List<HashMap<String, Object>> result = new ArrayList<>();
        
        try {
            result = unitBo.getAllUnitsByCompanyForRatify((String) param.get("realm"),
                    Integer.parseInt((String) param.get("companyId")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
        
    @RequestMapping(value = "/backoffice/units/updateUnit", method = RequestMethod.POST)
    public Profile updateUnitselected(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramUnit = (Map) param.get("unidad");

        Profile response = new Profile();
        response.put("result", false);

        try {
            response = unitBo.updateUnit(paramUnit);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return response;
    }
    
    @RequestMapping(value = "/backoffice/units/updateUnitUnsubscribe", method = RequestMethod.POST)
    public Profile updateUnitForUnsubscribe(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramUnitForUnsubscribe = (Map) param.get("unsubscribe");
        int contTrue = 0;
        int contFalse = 0;
        List<Map> unidades;
        unidades = (List) paramUnitForUnsubscribe.get("unidad");
        Profile response = new Profile();
   
        for (Map unidad : unidades) {
            try {
                unidad.put("realm", paramUnitForUnsubscribe.get("realm"));
                response = unitBo.updateUnitForUnsubscribe(unidad);
                contTrue++;
                response.put("result", true);
            } catch (Exception e) {
                contFalse++;
                response.put("result", false);
                e.printStackTrace();
            }
        }
        response.put("unidadOK", contTrue);
        response.put("unidadFail", contFalse);
        return response;
    }
    
    @RequestMapping(value = "/backoffice/units/getUnitByMid", method = RequestMethod.GET)
    public Vehicle getUnitByImei(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        Vehicle result = new Vehicle();
        result.put("status", false);
        try {
            result = unitBo.getUnitByMid((String) param.get("realm"),
                    (String) param.get("modemId"));
            result.put("status", true);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/units/getGeneralState", method = RequestMethod.GET)
    public List<Parameter> getGeneralState(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Parameter> result = new ArrayList<>();
        try {
            result = unitBo.getStatesByCodeName((String) param.get("realm"),
                    (String) param.get("codeName"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/units/getUnitListForCert", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getUnitForCertificate(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        
        List<HashMap<String, Object>> result = new ArrayList<>();
        try {
            result = unitBo.getUnitForCertificate((String) param.get("realm"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/units/getAccessoriesAndEventForValidate", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getAccessoriesAndEventForValidate(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        
        List<HashMap<String, Object>> result = new ArrayList<>();
        
        try {
            result = unitBo.getAccessoriesAndEventForValidate((String) param.get("realm"), 
                    (Integer) Integer.parseInt((String) param.get("deviceTypeId")), 
                    (String) param.get("mid"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return result;
    }
    
    @RequestMapping(value = "backoffice/units/insertInfoCertUnit", method = RequestMethod.POST)
    public Vehicle insertInfoCertUnit(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        
        Map<String, Object> paramInfoCert = (Map) param.get("unidad");
        Vehicle response = new Vehicle();
        response.put("result", false);
        try {
            response = unitBo.insertInfoCert(paramInfoCert);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
}
