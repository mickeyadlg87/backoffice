package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.backoffice.SimCard;
import com.redd.backoffice.bo.SimBo;
import java.util.List;
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
 * @author aleal
 */
@RestController
public class SimcardController {
    
    @Autowired
    SimBo simcardBo;
    
    /**
     * Metodo que guarda una lista de numeros de simcard con su respectivo ICCID
     * Con el fin de validar numeros correctos a la hora de la certificacion de GPS
     * @param realm
     * @param username
     * @param param
     * @param model
     * @param session
     * @return 
     */
    @RequestMapping(value = "/backoffice/simcard/saveList", method = RequestMethod.POST)
    public SimCard saveListSimcard(@RequestParam(value = "realm") String realm,
                                   @RequestParam(value = "username") String username,
                                   @RequestBody List<SimCard> param,
                                   Model model, HttpSession session) {

        SimCard response = new SimCard();
        response.put("result", false);

        try {
            response = simcardBo.saveSimcardList(realm, username, param);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    /**
     * Metodo que valida la tupla iccid/simcard para certificar con
     * simcard validas, las sim card se cargan en backoffice
     * @param realm
     * @param param
     * @param model
     * @param session
     * @return 
     */
    @RequestMapping(value = "/backoffice/simcard/getSim", method = RequestMethod.POST)
    public SimCard getSimByNumberOrCode(@RequestParam(value = "realm") String realm,
            @RequestBody SimCard param,
            Model model, HttpSession session) {
        
        SimCard response = new SimCard();
        response.put("result", false);
        
        try {
            response = simcardBo.getSimByNumberOrCode(realm, param);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }

}
