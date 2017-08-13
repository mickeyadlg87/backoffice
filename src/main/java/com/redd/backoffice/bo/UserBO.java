package com.redd.backoffice.bo;

import cl.tastets.life.objects.BasicEntity;
import cl.tastets.life.objects.Profile;
import cl.tastets.life.objects.User;
import cl.tastets.life.objects.utils.Paginated;
import cl.tastets.life.objects.utils.QueryFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class UserBO {

    private static final Logger logger = Logger.getLogger("UserBO");
    private final StringBuilder sb = new StringBuilder();
    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    PropertiesReaderUtil propertiesUtils;

    @Autowired
    RestServiceRequestUtil webServiceRequest;

    public List<User> getAllUsersByCompany(String realm, Integer companyId, String sortBy) {

        List<User> userList = new ArrayList<>();
        BasicEntity request = new BasicEntity();

        int limit = propertiesUtils.getLimitForGet();
        int offset = propertiesUtils.getOffsetForGet();

        request.put("paginated", Paginated.from().put("limit", limit).put("offset", offset));
        if (sortBy != null && !"".equals(sortBy)) {
            request.put("filter", QueryFilter.from().put("sort", sortBy));
        }

        logger.info(propertiesUtils.getUrlServiceUser() + "getAll?realm=" + realm + "&companyId=" + companyId + request);
        List<HashMap<String, Object>> rawList = webServiceRequest.getWSResponsePOSTList(propertiesUtils.getUrlServiceUser() + "getAll?realm=" + realm + "&companyId=" + companyId, request);

        rawList.stream().map((m) -> {
            User u = new User();
            u.putAll(m);
            return u;
        }).forEach((u) -> {
            userList.add(u);
        });

        return userList;
    }

    public Profile getProfileByUser(String realm, String username) {

        Profile perfil = new Profile();
        sb.setLength(0);
        sb.append(propertiesUtils.getUrlServiceAuthorization()).append("authorization/selectProfiles?realm=")
                .append(realm).append("&device=desktop&user=")
                .append(username);

        logger.info(sb.toString());
        perfil = (Profile) webServiceRequest.getWSResponseGET(sb.toString(), perfil);
        return perfil;
    }
    
    /**
     * trae info del backoffice referente al usuario
     * @param realm
     * @param platform
     * @param username
     * @return
     */
    public User getByUsername(String realm, String platform, String username) {

        User result = new User();
        sb.setLength(0);
        sb.append(propertiesUtils.getUrlUserBckService()).append("getByUserName?realm=").append(realm)
                .append("&platform=").append(platform).append("&userName=").append(username);
        logger.info(sb.toString());
        result = (User) webServiceRequest.getWSResponseGET(sb.toString(), result);
        return result;
    }

    /**
     * Obtiene una lista de perfiles por defecto, llamados paquetes funcionales
     * @param realm
     * @return 
     */
    public List<Profile> getDefaultProfiles(String realm) {

        BasicEntity request = new BasicEntity();
        request.put("paginated", Paginated.from());
        request.put("filter", new Profile().put("filter", Arrays.asList(new Profile().put("active", true))));
        String formedUrl = propertiesUtils.getUrlCustomerService() + "package/getPackageFunctionality?realm=" + realm;
        logger.info(formedUrl + " " + request);
        
        return webServiceRequest.getWSResponsePOSTGenericList(formedUrl, request, Profile[].class);
    }

    public Profile updateProfileForUsers(String realm, String username, List<HashMap> profilesEnabled) {

        Profile perfil = new Profile();
        sb.setLength(0);
        sb.append(propertiesUtils.getUrlServiceAuthorization()).append("authorization/addProfiles?realm=")
                .append(realm).append("&device=desktop&user=")
                .append(username);

        logger.info(sb.toString());
        webServiceRequest.getWsResponsePUTwithObject(sb.toString(), profilesEnabled);
        perfil.put("result", true);
        return perfil;
    }
    
    /**
     * 
     * @param param
     * @return 
     * @throws java.io.IOException 
     */
    public Profile updateUser(Map<String, Object> param) throws IOException {
        
        Profile profileToUpdate = new Profile();        
        profileToUpdate.putAll((Map) param.get("user"));
        profileToUpdate.put("profiles", new ArrayList<>());
        String realm = (String) param.get("realm");
        profileToUpdate.put("realm", realm);
        
        // se efectua la actualizacion de perfil del usuario unicamente si este viene explicito en la key profileSel
        if (profileToUpdate.get("profileSel") != null && !profileToUpdate.getString("profileSel").isEmpty()) {
            String profileSelString = profileToUpdate.getString("profileSel");
            String profileEdited = profileSelString.replaceAll("userSel", profileToUpdate.getString("userName")).replaceAll("plataformSel", realm);
            List<HashMap> profileMapped = mapper.readValue(profileEdited, List.class);
            updateProfileForUsers(realm, profileToUpdate.getString("userName"), profileMapped);
            profileToUpdate.remove("profileSel");
        }
        
        logger.info(propertiesUtils.getUrlServiceUser() + "update" + profileToUpdate);
        
        return (Profile) webServiceRequest.getWsResponsePUT(propertiesUtils.getUrlServiceUser() + "update", profileToUpdate);
    }
    
    /**
     * 
     * @param param
     * @return
     * @throws IOException 
     */
    public Profile insertUserForCompany(Map<String, Object> param) throws IOException {

        Profile userToCreate = new Profile();
        String realm = (String) param.get("realm");
        userToCreate.putAll((Map) param.get("user"));
        
        // Esta seccion crea el perfil de usuario bajo el esquema de perfilamiento nuevo
        // Obteniendo la seleccion de paquete funcional realizada al momento de la creacion
        // del usuario, se usa el servicio auth para guardar este perfil
        String defaultProfile = userToCreate.getString("functionalPackSel");
        String profileEdited = defaultProfile.replaceAll("userSel", userToCreate.getString("userName")).replaceAll("plataformSel", realm);
        Map<String, Object> profileMapped = mapper.readValue(profileEdited, Map.class);
        List<HashMap> arrayProfilesPackage = (List) profileMapped.get("profile");
        Integer idPackage = (Integer) profileMapped.get("id");
        updateProfileForUsers(realm, userToCreate.getString("userName"), arrayProfilesPackage);
        
        // Se borra el paquete funcional seleccionado ya que no es necesario 
        // para guardar el usuario en la plataforma establecida
        userToCreate.remove("functionalPackSel");
        userToCreate.put("realm", realm);
        userToCreate.put("functionalityId", idPackage);

        logger.info(propertiesUtils.getUrlServiceUser() + "save" + userToCreate);
        Profile response = new Profile();
        response.putAll(webServiceRequest.getWSResponsePOST(propertiesUtils.getUrlServiceUser() + "save", userToCreate));
                
        return response; 
    }
    
    /**
     * Metodo por el cual se authentica en el sistema un usuario, el realm = gps
     * hace que la autenticacion sea a traves del correo de reddsystem
     * @param userName
     * @param password
     * @return 
     */
    public Boolean loginUser(String userName, String password) {
        
        User dataUser = new User();
        
        sb.setLength(0);
        sb.append(propertiesUtils.getUrlServiceAuthorization()).append("login?realm=")
                .append("gps").append("&device=desktop&user=")
                .append(userName).append("&pass=")
                .append(password);
        
        dataUser = (User) webServiceRequest.getWSResponseWithFinalRsGET(sb.toString(), dataUser);
        logger.info(propertiesUtils.getUrlServiceAuthorization() + "login?user=" + userName);
        
        return dataUser.getString("status").equals("ok");
    }
}
