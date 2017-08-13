package com.redd.backoffice.bo;

import cl.tastets.life.objects.backoffice.SimCard;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.util.List;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author aleal
 */
@Component
public class SimBo {
    
    private static final Logger logger = Logger.getLogger("SimBO");

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;
    
    /**
     * llama servicio de backoffice/simcard para guardar info de simcard
     * @param realm
     * @param user
     * @param simcardList
     * @return 
     */
    public SimCard saveSimcardList(String realm, String user, List<SimCard> simcardList) {

        String url = propertiesUtils.getUrlParamService() + "simcard/save";
        simcardList.stream().map((simcard) -> {
            simcard.put("username", user).put("realm", realm);
            return simcard;
        }).forEach((s) -> {
            try {
                webServiceRequest.getWSResponsePOST(url, s);
            } catch (Exception e) {
                logger.error("Error en tupla : " + s + ", exception : " + e.getMessage());
            }
        });
        logger.info(url + ", listSize = " + simcardList.size());
        return new SimCard().put("result", true);
    }
    
    /**
     * trae info de la simcard ya sea por iccid o por numero
     * @param realm
     * @param param
     * @return 
     */
    public SimCard getSimByNumberOrCode(String realm, SimCard param) {
        String typeNumber = param.getString("type");
        String url = propertiesUtils.getUrlParamService();
        SimCard response = new SimCard();
        switch (typeNumber) {
            case "ICCID":
                response.putAll(webServiceRequest.getWSRequestObjectPOST(url + "simcard/getSimCardByIccid?realm=" + realm + "&iccid=" + param.getString("value"), null));
                response.put("result", !response.isEmpty());
                return response;
            case "NUMBER":
                response = (SimCard) webServiceRequest.getWSResponseGET(url + "simcard/getSimCardByPhoneNumber?realm=" + realm + "&phoneNumber=" + param.getString("value"), response);
                response.put("result", !response.isEmpty());
                return response;
            default:
                return new SimCard().put("result", false);
        }
    }

}
