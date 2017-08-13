package com.redd.backoffice.bo;

import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Event;
import cl.tastets.life.objects.Parameter;
import cl.tastets.life.objects.Profile;
import cl.tastets.life.objects.utils.Paginated;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
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
public class PotaBO {

    private static final Logger logger = Logger.getLogger("PotaBO");

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;

    public Parameter executePotaCommand(Map<String, Object> paramToPotaCommand) throws IOException {

        Parameter response = new Parameter();
        Map<String, Object> content = (Map) new HashMap<>((Map) paramToPotaCommand.get("potacommand")).get("contentpota");
        StringBuilder sb = new StringBuilder();
        sb.append(propertiesUtils.getUrlServicePotaCommand()).append("sendPotaCommand?platform=").append(content.get("platform")).append("&")
                .append("mid=").append(content.get("mid")).append("&idPotaCommand=").append(content.get("codeType"));

        logger.info(sb.toString());

        response.putAll(webServiceRequest.getWSRequestObjectPOST(sb.toString(), null));
        response.put("result", true);
        return response;

    }

    public Parameter executePotaCommandWithFilter(Map<String, Object> paramToPotaCommand) throws IOException {

        Parameter response = new Parameter();
        Map<String, Object> content = (Map) new HashMap<>((Map) paramToPotaCommand.get("potacommand")).get("contentpota");
        Parameter request = new Parameter();
        request.put("paginated", new Event());
        if (content.get("horometer") != null) {
            request.put("filter", new Profile().put("filter", Arrays.asList(new Profile().put("hourmeterTime", content.get("horometer")))));
        }
        if (content.get("odometer") != null) {
            request.put("filter", new Profile().put("filter", Arrays.asList(new Profile().put("odometerKm", content.get("odometer")))));
        }
        StringBuilder sb = new StringBuilder();
        sb.append(propertiesUtils.getUrlServicePotaCommand()).append("sendCommandWithVariables?platform=").append(content.get("platform")).append("&")
                .append("mid=").append(content.get("mid")).append("&idPotaCommand=").append(content.get("codeType"));

        logger.info(sb.toString() + request);

        response.putAll(webServiceRequest.getWSRequestObjectPOST(sb.toString(), request));
        response.put("result", true);
        return response;
    }

    public List<Parameter> getCommandTypes(String realm) {

        List<Parameter> response = new ArrayList<>();
        String url = propertiesUtils.getUrlServicePotaCommand() + "getTypes?realm=" + realm;
        logger.info(url);
        List<HashMap<String, Object>> rawList = (List) webServiceRequest.getWSResponseGET(url, response);

        rawList.stream().map((t) -> {
            Parameter comm = new Parameter();
            comm.putAll(t);
            return comm;
        }).forEach((parseComm) -> {
            response.add(parseComm);
        });

        return response;
    }

    public List<Parameter> getHistoryforImei(String realm, String mid) {

        List<Parameter> response;
        String url = propertiesUtils.getUrlServicePotaCommand() + "getCallbackByImei?realm=" + realm + "&mid=" + mid;
        logger.info(url);
        Parameter requestData = new Parameter().put("paginated", new Parameter()).put("filter", new Parameter());

        response = webServiceRequest.getWSResponsePOSTGenericList(url, requestData, Parameter[].class);
        return response;

    }

    public Parameter getObjectPota(String realm, Integer deviceTypeId, String codeType) {

        Parameter response = new Parameter();
        String url = propertiesUtils.getUrlServicePotaCommand() + "getCommandByDeviceType?realm=" + realm + "&deviceTypeId=" + deviceTypeId + "&codeType=" + codeType;
        logger.info(url);
        response = (Parameter) webServiceRequest.getWSResponseGET(url, response);
        return response;
    }

}
