package com.redd.backoffice.restcontrollers;

import cl.tastets.life.objects.Profile;
import cl.tastets.life.objects.User;
import com.redd.backoffice.bo.UserBO;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller asociado a la busqueda de empresas
 *
 * @author aleal
 */
@RestController
public class UserController {

    @Autowired
    UserBO userBo;

    @RequestMapping(value = "/backoffice/users/getListUsersByCompany", method = RequestMethod.GET)
    public List<User> getListUsers(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<User> result = new ArrayList<>();

        try {
            result = userBo.getAllUsersByCompany((String) param.get("realm"),
                    Integer.parseInt((String) param.get("companyId")),
                    (String) param.get("sortBy"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/users/getProfileForUser", method = RequestMethod.GET)
    public Profile getProfileUser(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        Profile result = new Profile();
        try {
            result = userBo.getProfileByUser((String) param.get("realm"),
                    (String) param.get("userName"));

            List proDetail = (List) result.get("profiles");
            result.put("hadProfile", proDetail != null && !proDetail.isEmpty());

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    
    @RequestMapping(value = "/backoffice/users/getByUsername", method = RequestMethod.GET)
    public User getInfoByUsername(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        User result = new User();
        result.put("status", false);
        try {
            result = userBo.getByUsername((String) param.get("realm"),
                    (String) param.get("platform"), (String) param.get("username"));
            result.put("status", true);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    
    @RequestMapping(value = "/backoffice/users/getProfilesForAsigned", method = RequestMethod.GET)
    public List<Profile> profilesForAsigned(@RequestParam Map<String, Object> param, Model model,
            HttpSession session) {

        List<Profile> result = new ArrayList<>();
        try {
            result = userBo.getDefaultProfiles((String) param.get("realm"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    @RequestMapping(value = "/backoffice/users/updateProfileForUser", method = RequestMethod.POST)
    public Profile updateProfileForUser(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramProfileUser = (Map) new HashMap<>((Map) param.get("user")).get("content");

        Profile response = new Profile();
        response.put("result", false);
        try {
            List<HashMap> profilesList = (List) paramProfileUser.get("profiles");
            response = userBo.updateProfileForUsers((String) paramProfileUser.get("plataform"), (String) paramProfileUser.get("userName"), profilesList);
            Logger.getRootLogger().info("UpdateProfileForUser = " + response);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/users/updateUserSelected", method = RequestMethod.POST)
    public Profile updateUserSelected(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramUser = new HashMap<>((Map) param.get("user"));

        Profile response = new Profile();
        response.put("result", false);
        try {
            response = userBo.updateUser(paramUser);
            response.put("result", true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
    
    @RequestMapping(value = "/backoffice/users/insertNewUser", method = RequestMethod.POST)
    public Profile insertUser(@RequestBody Map<String, Object> param, Model model,
            HttpSession session) {

        Map<String, Object> paramUser = (Map) param.get("user");

        Profile response = new Profile();
        response.put("result", false);
        try {
            response = userBo.insertUserForCompany(paramUser);
            response.put("result", true);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }

    /**
     * Metodo para autenticacion
     * @param user
     * @return 
     */
    @RequestMapping("/user")
    public Principal user(Principal user) {
        return user;
    }

}
