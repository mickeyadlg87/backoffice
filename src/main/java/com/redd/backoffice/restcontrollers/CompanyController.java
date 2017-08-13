package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.Company;
import com.redd.backoffice.bo.CompanyBO;
import java.util.ArrayList;
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
 * Controller asociado a la busqueda de empresas
 *
 * @author aleal
 */
@RestController
public class CompanyController {

    @Autowired
    CompanyBO companyBo;

    @RequestMapping(value = "/backoffice/company/getMetadataCompanyList", method = RequestMethod.GET)
    public List<Company> getListCompany(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Company> result = new ArrayList<>();

        try {
            result = companyBo.getAllCompaniesPaginated((String) param.get("realm"),
                    Integer.parseInt((String) param.get("limit")),
                    Integer.parseInt((String) param.get("offset")),
                    (String) param.get("sortBy"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/company/getCustomerBackoffice", method = RequestMethod.GET)
    public Company getCustomerByExternalId(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        
        Company result = new Company();
        try {
            result = companyBo.getCustomerBackoffice((String) param.get("plataform"),
                    Integer.parseInt((String) param.get("externalCustomerId")));;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/company/updateMetaCompany", method = RequestMethod.POST)
    public Company updateCompany(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        
        Map<String, Object> paramCompany = (Map) param.get("company");
        
        Company response = new Company();
        response.put("result", false);
        try {
            response = companyBo.updateCompanyPlataform(paramCompany);
            response.put("result", true);

        } catch (Exception e) {
            e.printStackTrace();

        }
        return response;

    }
    
    
    @RequestMapping(value = "/backoffice/company/insertMetaCompany", method = RequestMethod.POST)
    public Company insertCompany(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramCompany = (Map) param.get("company");

        Company response = new Company();
        response.put("result", false);
        try {
            response = companyBo.insertCompanyPlataform(paramCompany);
            Logger.getRootLogger().info("InsertCompany = " + response);
        } catch (Exception e) {
            e.printStackTrace();

        }
        return response;

    }

}
