package com.redd.backoffice.services;

import javax.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 *
 * Clase que direcciona la entrada al sistema
 *
 * @author aleal
 */
@Controller
public class BackOfficeHome {

    @RequestMapping(value = {"/", "/index", "/customer", "/usuarios", "/unidades", "/devicetype", "/signin", "/dispositivos",
        "/searchByMid", "/reporteFacturacion", "/unsubscribe", "/addProfile", "/reporteDadosDeBajas", "/certificarUnidad",
        "/potaCommand", "/reporteUnidadesCertificadas", "/ratify", "/visualizadorDeEventos",
        "/reporteDispositivosCertificados", "/cargaSimcard", "/reporteKeepAlive"}, method = RequestMethod.GET)
    public String index(
            Model model, HttpSession session) {
        return "index";
    }

}
