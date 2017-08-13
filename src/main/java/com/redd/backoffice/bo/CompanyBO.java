package com.redd.backoffice.bo;

import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Company;
import cl.tastets.life.objects.utils.Paginated;
import cl.tastets.life.objects.utils.QueryFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author aleal
 */
@Component
public class CompanyBO {

    private static final Logger logger = Logger.getLogger("CompanyBO");

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;
    
    @Autowired
    UserBO userBo;

    public List<Company> getAllCompaniesPaginated(String realm, Integer limit, Integer offset, String sortBy) {

        List<Company> companiesList = new ArrayList<>();
        BasicEntity request = new BasicEntity();
        
        limit = propertiesUtils.getLimitForGet();
        offset = propertiesUtils.getOffsetForGet();
        
        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));
        if (sortBy != null && !"".equals(sortBy)) {
            request.put("filter", QueryFilter.from().put("sort", sortBy));
        }

        logger.info(propertiesUtils.getUrlServiceCompany() + "getAll?realm=" + realm + request);
        List<HashMap<String, Object>> rawList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceCompany() + "getAll?realm=" + realm, request);

        rawList.stream().map((m) -> {
            Company c = new Company();
            c.putAll(m);
            return c;
        }).forEach((c) -> {
            companiesList.add(c);
        });

        return companiesList;

    }
    
     
     public Company getCustomerBackoffice(String plataform, Integer externalCustomerId) {
        Map<String, Object> cutomerBackoffice;
        Company result = new Company();
        logger.info(propertiesUtils.getUrlCustomerService() + "getByExternalId?plataform=" + plataform + "&externalCustomerId=" + externalCustomerId);
        cutomerBackoffice = webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlCustomerService() + "getByExternalId?plataform=" + plataform + "&externalCustomerId=" + externalCustomerId, new HashMap<>());
        result.putAll(cutomerBackoffice);
        return result;
    }
    
    
    public Company updateCompanyPlataform(Map<String, Object> param) {

        Company companyToUpdate = new Company();
        companyToUpdate.putAll((Map) param.get("company"));
        String realm = (String) param.get("realm");
        companyToUpdate.put("realm", "backoffice");
        companyToUpdate.put("platform", realm);
        
        if (companyToUpdate.get("companyWithoutBackoffice") != null && companyToUpdate.getBoolean("companyWithoutBackoffice")){
            logger.info(propertiesUtils.getUrlCustomerService() + "save");
            webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlCustomerService() + "save", companyToUpdate);
        } else {
            logger.info(propertiesUtils.getUrlCustomerService() + "update");
            webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlCustomerService() + "update", companyToUpdate);
        }
        
        Company companyToUpdatePlataform = new Company();
        companyToUpdatePlataform.put("realm", realm);
        companyToUpdatePlataform.put("id", companyToUpdate.get("customerExternalId"));
        companyToUpdatePlataform.put("name", companyToUpdate.get("customerName"));
        companyToUpdatePlataform.put("businessName", companyToUpdate.get("businessName"));
        companyToUpdatePlataform.put("address", companyToUpdate.get("address"));
        companyToUpdatePlataform.put("rut", companyToUpdate.get("rut"));
        companyToUpdatePlataform.put("phone", companyToUpdate.get("tradeContactPhone"));
        companyToUpdatePlataform.put("secondaryPhone", companyToUpdate.get("tradeContactPhoneTwo"));
        companyToUpdatePlataform.put("maxVehicles", companyToUpdate.get("companyMaxVehicles"));
        companyToUpdatePlataform.put("email", companyToUpdate.get("tradeContactMail"));
        companyToUpdatePlataform.put("resellerId", companyToUpdate.get("resellerId"));
        companyToUpdatePlataform.put("planId", companyToUpdate.get("planId"));
        companyToUpdatePlataform.put("maxUsersPerCompany", companyToUpdate.get("companyMaxUsers"));
        companyToUpdatePlataform.put("weeklyReport", companyToUpdate.get("companyWeeklyReport"));
        companyToUpdatePlataform.put("alias", companyToUpdate.get("customerAlias"));
        
        logger.info(propertiesUtils.getUrlServiceCompany() + "update" + companyToUpdatePlataform);
        return (Company) webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceCompany() + "update", companyToUpdatePlataform);

    }
    
    public Company insertCompanyPlataform(Map<String, Object> param) {

        Company companyToCreate = new Company();
        companyToCreate.putAll((Map) param.get("company"));
        String realm = (String) param.get("realm");
        companyToCreate.put("realm", "backoffice");

        Company insertRealm = new Company();
        insertRealm.put("realm", realm);
        insertRealm.put("name", companyToCreate.get("customerName"));
        insertRealm.put("alias", companyToCreate.get("customerAlias"));
        insertRealm.put("businessName", companyToCreate.get("businessName"));
        insertRealm.put("address", companyToCreate.get("address"));
        insertRealm.put("rut", companyToCreate.get("rut"));
        insertRealm.put("phone", companyToCreate.get("tradeContactPhone"));
        insertRealm.put("secondaryPhone", companyToCreate.get("tradeContactPhoneTwo"));
        insertRealm.put("maxVehicles", companyToCreate.get("maxVehicles"));
        insertRealm.put("email", companyToCreate.get("tradeContactMail"));
        insertRealm.put("resellerId", companyToCreate.get("resellerId"));
//        insertRealm.put("planId", companyToCreate.get("customerName"));
        insertRealm.put("maxUsersPerCompany", companyToCreate.get("maxUsersPerCompany"));
        insertRealm.put("weeklyReport", companyToCreate.get("weeklyReport"));
        insertRealm.put("reseller", companyToCreate.get("reseller"));
        
        Company response = new Company();
        
        try {
            logger.info(propertiesUtils.getUrlServiceCompany() + "save" + insertRealm);
            Map<String, Object> resp = webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceCompany() + "save", insertRealm);
            if (resp.get("id") != null){
                companyToCreate.put("customerExternalId", resp.get("id"));
                companyToCreate.put("platform", realm);
                logger.info(propertiesUtils.getUrlCustomerService() + "save");
                webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlCustomerService() + "save", companyToCreate);
                
                /**
                 * crea usuario administrador para la empresa recien creada
                 */
                BasicEntity createUser = new BasicEntity();
                BasicEntity newAdminUser = new BasicEntity();
                newAdminUser.put("rut", companyToCreate.get("rut"));
                newAdminUser.put("userName", companyToCreate.getString("customerAlias")+".admin");
                newAdminUser.put("name", companyToCreate.get("customerName"));
                newAdminUser.put("phone", companyToCreate.get("tradeContactPhone"));
                newAdminUser.put("email", companyToCreate.get("tradeContactMail"));
                newAdminUser.put("companyId", resp.get("id"));
                newAdminUser.put("isAdmin", true);
                newAdminUser.put("alias", companyToCreate.get("customerAlias"));
                String stringFunctionalPackage = new ObjectMapper().writeValueAsString(companyToCreate.get("functionalPackage"));
                newAdminUser.put("functionalPackSel", stringFunctionalPackage);                               
                
                createUser.put("realm", realm);
                createUser.put("user", newAdminUser);
                userBo.insertUserForCompany(createUser);
                response.put("result", true);
            } else {
                response.put("result", false);
            }
        }catch (Exception e){
            logger.error("Error guardando empresa : " + e.getMessage());
            response.put("result", false);
        }
        return response; 

    }

}
