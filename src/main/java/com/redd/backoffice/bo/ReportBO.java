package com.redd.backoffice.bo;

import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Parameter;
import cl.tastets.life.objects.utils.Paginated;
import cl.tastets.life.objects.utils.QueryFilter;
import com.redd.backoffice.utils.PropertiesReaderUtil;
import com.redd.backoffice.utils.RestServiceRequestUtil;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author fgodoy
 */
@Component
public class ReportBO {
    
    private static final Logger logger = Logger.getLogger("ReportBO");
    
    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;
    
    public List<BasicEntity> getFacturationReportPaginated(String realm, Integer limit, Integer offset) {

        List<BasicEntity> facturationList = new ArrayList<>();
        BasicEntity request = new BasicEntity();

        limit = propertiesUtils.getLimitForGetReport();
        offset = propertiesUtils.getOffsetForGetReport();
        request.put("filter", QueryFilter.from());
        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));

        logger.info(propertiesUtils.getUrlServiceReport() + "getFacturationReportFilter?realm=" + realm + request);
        List<HashMap<String, Object>> facList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceReport() + "getFacturationReportFilter?realm=" + realm, request);

        facList.stream().map((m) -> {
            BasicEntity f = new BasicEntity();
            f.putAll(m);
            return f;
        }).forEach((f) -> {
            facturationList.add(f);
        });

        return facturationList;
    }
    
    public List<HashMap<String, Object>> getAllReportForFacturate(String realm) {
        logger.info(propertiesUtils.getUrlServiceReport() + "getAllFacturationReport?realm=" + realm);
        List<HashMap<String, Object>> response = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceReport() + "getAllFacturationReport?realm=" + realm, new BasicEntity());
        return response;
    }
    
    public List<HashMap<String, Object>> getUnsubscribeReportFromDate(String realm, Long from, Long to){
        logger.info(propertiesUtils.getUrlServiceReport() + "getUnsubscribeReport?realm=" + realm + "&from=" + from + "&to=" + to);
        List<HashMap<String, Object>> uList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceReport() + "getUnsubscribeReport?realm=" + realm + "&from=" + from + "&to=" + to, new BasicEntity());
        return uList;
    }
    
    public List<BasicEntity> getQuantityForCompanyPaginated(String realm, Integer limit, Integer offset) {

        List<BasicEntity> quantityList = new ArrayList<>();
        BasicEntity request = new BasicEntity();

        limit = propertiesUtils.getLimitQuantityForCompany();
        offset = propertiesUtils.getOffsetQuantityForCompany();
        request.put("filter", QueryFilter.from());
        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));

        logger.info(propertiesUtils.getUrlServiceReport() + "getQuantityForCompanyPaginated?realm=" + realm + request);
        List<HashMap<String, Object>> topList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceReport() + "getQuantityForCompanyPaginated?realm=" + realm, request);

        topList.stream().map((t) -> {
            BasicEntity q = new BasicEntity();
            q.putAll(t);
            return q;
        }).forEach((q) -> {
            quantityList.add(q);
        });

        return quantityList;
    }
    
    public List<BasicEntity> getQuantityForTypeSale(String realm) {
        
        List<BasicEntity> quantityList = new ArrayList<>();
        logger.info(propertiesUtils.getUrlServiceReport() + "getQuantityBySaleType?realm=" + realm);
        
        List<HashMap<String, Object>> topList = (List) webServiceRequest.getWSResponseGET(propertiesUtils.getUrlServiceReport() + "getQuantityBySaleType?realm=" + realm, quantityList);
        
        topList.stream().map((t) -> {
            BasicEntity q = new BasicEntity();
            q.putAll(t);
            return q;
        }).forEach((q) -> {
            quantityList.add(q);
        });
        
        return quantityList;
    }
    
    public BasicEntity insertNewBackofficeReport(Map<String, Object> param) {

        BasicEntity reportToInsert = new BasicEntity();

        reportToInsert.putAll((Map) param.get("facturation"));
        String realm = (String) param.get("realm");
        reportToInsert.put("realm", realm);
        logger.info(propertiesUtils.getUrlServiceReport() + "saveReport" + reportToInsert);
        BasicEntity retorno = new BasicEntity(webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceReport() + "saveReport", reportToInsert));
        return retorno;
    }
    
    public BasicEntity updateReportBackoffice(Map<String, Object> param) {

        BasicEntity reportToUpdate = new BasicEntity();

        reportToUpdate.putAll((Map) param.get("facturation"));
        String realm = (String) param.get("realm");
        reportToUpdate.put("realm", realm);

        logger.info(propertiesUtils.getUrlServiceReport() + "updateReport" + reportToUpdate);

        return (BasicEntity) webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceReport() + "updateReport", reportToUpdate);

    }
    
    public List<HashMap<String, Object>> getCertifiedReportFromDate(String realm, String platform, Long from, Long to){
        logger.info(propertiesUtils.getUrlServiceReport() + "getCertifiedReport?realm=" + realm + "&platform=" + platform + "&from=" + from + "&to=" + to);
        List<HashMap<String, Object>> certifiedList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceReport() + "getCertifiedReport?realm=" + realm + "&platform=" + platform + "&from=" + from + "&to=" + to, new BasicEntity());
        return certifiedList;
    }
    
    public List<Parameter> getCertifiedDevicesReportFromToDate(String realm, Long from, Long to) {
        String url = propertiesUtils.getUrlServiceAccessories() + "getAllInstalled?realm=" + realm;
        Parameter request = new Parameter()
                .put("paginated", Paginated.from().put("limit", 1000).put("offset", 0))
                .put("filter", new Parameter().put("filter", Arrays.asList(new Parameter().put("dateFromTo", Arrays.asList(from, to)))));
        logger.info(url + request);
        List<Parameter> certifiedList = webServiceRequest.getWSResponsePOSTGenericList(url, request, Parameter[].class);
        return certifiedList;
    }
    
    public List<Parameter> getKeepAliveInfo(String realm) {
        String url = propertiesUtils.getUrlServiceReport() + "getKeepAliveForEachCustomer?realm=" + realm;
        logger.info(url);
        List<Parameter> keepAliveList = webServiceRequest.getWSResponsePOSTGenericList(url, null, Parameter[].class);

        List<Parameter> orderedKeepAlive = keepAliveList.stream().map((keepAlive) -> {
            keepAlive.put("total", keepAlive.getInteger("withKA") + keepAlive.getInteger("withoutKA"));
            keepAlive.put("percentWithKA", (keepAlive.getDouble("withKA") / keepAlive.getDouble("total")) * 100);
            keepAlive.put("percentWithoutKA", 100.0 - keepAlive.getDouble("percentWithKA"));
            return keepAlive;
        }).collect(Collectors.toList());

        return orderedKeepAlive;
    }
    
}
