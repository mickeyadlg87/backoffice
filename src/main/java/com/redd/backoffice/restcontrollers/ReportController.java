package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Parameter;
import com.redd.backoffice.bo.ReportBO;
import java.util.ArrayList;
import java.util.HashMap;
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
 *
 * @author fgodoy
 */
@RestController
public class ReportController {

    @Autowired
    ReportBO reportBo;

    @RequestMapping(value = "/backoffice/units/getUnsubcribeReport", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getUnsubscrubeListUnits(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<HashMap<String, Object>> result = new ArrayList<>();
        try {
            result = reportBo.getUnsubscribeReportFromDate((String) param.get("realm"),
                    Long.parseLong((String) param.get("from")), Long.parseLong((String) param.get("to")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/report/getFacturationReportFilter", method = RequestMethod.GET)
    public List<BasicEntity> getFacturationReportWithFilter(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<BasicEntity> result = new ArrayList<>();
        try {
            result = reportBo.getFacturationReportPaginated((String) param.get("realm"), null, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/report/getAllFacturationReport", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getFacturationReport(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<HashMap<String, Object>> result = new ArrayList<>();
        try {
            result = reportBo.getAllReportForFacturate((String) param.get("realm"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/report/getQuantityForCompanyFilter", method = RequestMethod.GET)
    public List<BasicEntity> getQuantityForCompanyWithFilter(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<BasicEntity> result = new ArrayList<>();
        try {
            result = reportBo.getQuantityForCompanyPaginated((String) param.get("realm"), null, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/report/getQuantityForSaleType", method = RequestMethod.GET)
    public List<BasicEntity> getQuantityForSaleType(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<BasicEntity> result = new ArrayList<>();
        try {
            result = reportBo.getQuantityForTypeSale((String) param.get("realm"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/report/updateReport", method = RequestMethod.POST)
    public BasicEntity updateReportBackoffice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        Map<String, Object> paramReportUpdated = new HashMap<>((Map) param.get("facturation"));
        BasicEntity response = new BasicEntity();
        response.put("result", false);
        try {
            response = reportBo.updateReportBackoffice(paramReportUpdated);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();;
        }
        return response;
    }

    @RequestMapping(value = "/backoffice/report/insertNewReport", method = RequestMethod.POST)
    public BasicEntity insertReportBackoffice(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {
        Map<String, Object> paramNewReport = new HashMap<>((Map) param.get("facturation"));
        BasicEntity response = new BasicEntity();
        response.put("result", false);
        try {
            response = reportBo.insertNewBackofficeReport(paramNewReport);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }

    @RequestMapping(value = "/backoffice/report/getCertifiedReport", method = RequestMethod.GET)
    public List<HashMap<String, Object>> getCertifiedReportList(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<HashMap<String, Object>> result = new ArrayList<>();
        try {
            result = reportBo.getCertifiedReportFromDate((String) param.get("realm"),
                    (String) param.get("platform"),
                    Long.parseLong((String) param.get("from")),
                    Long.parseLong((String) param.get("to")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/report/getCertifiedDevicesReport", method = RequestMethod.GET)
    public List<Parameter> getCertifiedDevicesReportList(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {
        List<Parameter> result = new ArrayList<>();
        try {
            result = reportBo.getCertifiedDevicesReportFromToDate((String) param.get("realm"),
                    Long.parseLong((String) param.get("from")),
                    Long.parseLong((String) param.get("to")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/report/keepAlivePerCustom", method = RequestMethod.GET)
    public List<Parameter> getKeepAliveSumary(@RequestParam(value = "realm") String realm, Model model,
            HttpSession session) {
        List<Parameter> result = new ArrayList<>();
        try {
            result = reportBo.getKeepAliveInfo(realm);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

}
