package com.redd.backoffice.restcontrollers;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author aleal
 */
@RestController
public class DataExportController {

    /**
     * 
     * @param param
     * @param session
     * @return String si la data fue guardada correctamente (1 ó 0)
     */
    @RequestMapping(value = "/backoffice/dataToExport", method = RequestMethod.POST)
    public Map<String, Object> setDataToExport(@RequestBody Map<String, Object> param, HttpSession session) {
        Map<String, Object> response = new HashMap();
        try {
            session.setAttribute("dataSourceExport", (Map<String, Object>) param.get("export"));
            response.put("status", "1");
            return response;
        } catch (Exception e) {
            response.put("status", "0");
            return response;
        }
    }

}
