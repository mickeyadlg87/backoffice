
package com.redd.backoffice.restcontrollers;

import com.redd.backoffice.services.export.ExportPdfService;
import com.redd.backoffice.services.export.ExportXlsService;
import java.util.HashMap;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author aleal
 */
@RestController
public class ExportController {
    
    @Autowired
    ExportXlsService exportXlsService;

    @Autowired
    ExportPdfService exportPdfService;
    
    /**
     * Metodo que exportara a Xls
     *
     * @param session
     * @param response
     * @throws java.lang.Exception
     */
    @RequestMapping(value = "/export/xls", method = RequestMethod.GET)
    public void getAsXls(HttpSession session, HttpServletResponse response) throws Exception {
        if (session.getAttribute("dataSourceExport") != null) {
            try {
                exportXlsService.exportData((HashMap<String, Object>) session.getAttribute("dataSourceExport"), session, response, "");
            } catch (Exception e) {
                // TODO Auto-generated catch block
                throw new Exception("Error al generar excel : ", e);
            }
        }
    } 
    
    /**
     * Metodo que exportara a Pdf
     *
     * @param session
     * @param response
     * @throws java.lang.Exception
     */
    @RequestMapping(value = "/export/pdf", method = RequestMethod.GET)
    public void getAsPdf(HttpSession session, HttpServletResponse response) throws Exception {
        if (session.getAttribute("dataSourceExport") != null) {
            try {
                exportPdfService.exportData((HashMap<String, Object>) session.getAttribute("dataSourceExport"), session, response, "sdfsdfsd");
            } catch (Exception e) {
                // TODO Auto-generated catch block
                throw new Exception("Error al generar pdf : ", e);
            }
        }
    }

}
