package com.redd.backoffice.utils;

import cl.gps.drivers.objects.DeviceEvent;
import cl.tastets.life.commons.services.ClientExternal;
import cl.tastets.life.objects.utils.QueryFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 *
 * @author aleal
 */
@Service
public class RestServiceRequestUtil {

    private static final Logger logger = LoggerFactory.getLogger(RestServiceRequestUtil.class);
    private static ClientExternal client;
    private final RestTemplate privateRs = new RestTemplate();

    @Autowired
    ObjectMapper jacksonJsonObjectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        privateRs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
    }

    /**
     * Metodo que retorna el resultado de una llamada POST
     *
     * @param urlWS Ruta de la peticion
     * @param request Parametros de la peticion
     * @return Map que contiene la respuesta de una peticion POST
     */
    public HashMap<String, Object> getWSResponsePOST(String urlWS, HashMap<String, Object> request) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());

        return rs.postForObject(urlWS, request, HashMap.class);
    }
    
    /**
     * retorna el resultado de un post pasandole como argumento un objeto ya formateado
     * 
     * @param urlWS
     * @param request
     * @return 
     */
    public HashMap<String, Object> getWSRequestObjectPOST(String urlWS, Object request) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());

        return rs.postForObject(urlWS, request, HashMap.class);
    }
    
    
    public HashMap postRequestUrlEncoded(String urls) throws IOException {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_FORM_URLENCODED));
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        
        String status = restTemplate.exchange(urls, HttpMethod.POST, entity, String.class).getBody();
        HashMap response = jacksonJsonObjectMapper.readValue(status, HashMap.class);
        
        return response;
    }

    /**
     * Metodo que retorna el resultado de una llamada PUT
     *
     * @param urlWS
     * @param request
     * @return
     */
    public HashMap<String, Object> getWsResponsePUT(String urlWS, HashMap<String, Object> request) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        rs.put(urlWS, request);
        return request;

    }

    /**
     * Metodo que retorna el resultado de put como un objeto
     * @param urlWS
     * @param request
     * @return 
     */
    public Object getWsResponsePUTwithObject(String urlWS, Object request) {
        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        rs.put(urlWS, request);
        return request;
    }

    /**
     * Retorna la llamada a un metodo DELETE
     *
     * @param urlWS
     * @param request
     * @return
     */
    public HashMap<String, Object> getWsResponseDelete(String urlWS, HashMap<String, Object> request) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        rs.delete(urlWS, request);
        return request;
    }

    /**
     * Metodo que retorna el resultado de una llamada POST con uso de thread
     *
     * @param urlWS Ruta de la peticion
     * @param request Parametros de la peticion
     * @return Map que contiene la respuesta de una peticion POST
     */
    public List getWSResponsePOSTThreaded(String urlWS, HashMap<String, Object> request, HashMap<String, Object> extraParam, int type) {

        int threads = 4;

        List<HashMap<String, Object>> vehicleList = (ArrayList<HashMap<String, Object>>) request.get("moviles");
        List responseList = Collections.synchronizedList(new ArrayList());
        List[] vehicleSubList = new ArrayList[threads];
        Thread[] vehicleThreads = new Thread[threads];

        int indice = 0;
        for (HashMap<String, Object> vehicle : vehicleList) {

            if (vehicleSubList[indice] == null) {
                vehicleSubList[indice] = new ArrayList();
            }

            vehicleSubList[indice].add(vehicle);
            if (indice + 1 != threads) {
                indice++;
            } else {
                indice = 0;
            }
        }

        for (int index = 0; index < threads; index++) {
            if (vehicleSubList[index] != null) {

                HashMap<String, Object> swRequest = new HashMap<String, Object>();
                try {
                    swRequest.put("moviles", vehicleSubList[index]);
                    swRequest.put("periodos", (List) request.get("periodos"));

                    if (extraParam != null) {
                        swRequest.putAll(extraParam);
                    }

                    logger.info(jacksonJsonObjectMapper.writeValueAsString(swRequest));
                } catch (IOException e) {
                    logger.info("", e);
                }
                vehicleThreads[index] = new Thread(new WsPetitionRunnable(swRequest, new RestTemplate(), responseList, urlWS, type));
            }
        }

        try {
            if (vehicleThreads[1] == null) {
                vehicleThreads[0].start();
                vehicleThreads[0].join();
            } else if (vehicleThreads[2] == null) {
                vehicleThreads[0].start();
                vehicleThreads[1].start();
                vehicleThreads[0].join();
                vehicleThreads[1].join();
            } else if (vehicleThreads[3] == null) {
                vehicleThreads[0].start();
                vehicleThreads[1].start();
                vehicleThreads[2].start();
                vehicleThreads[0].join();
                vehicleThreads[1].join();
                vehicleThreads[2].join();
            } else {
                vehicleThreads[0].start();
                vehicleThreads[1].start();
                vehicleThreads[2].start();
                vehicleThreads[3].start();
                vehicleThreads[0].join();
                vehicleThreads[1].join();
                vehicleThreads[2].join();
                vehicleThreads[3].join();
            }

        } catch (InterruptedException e) {
            logger.info("", e);
        }

        if (responseList == null) {
            responseList = new ArrayList();
        }
        return responseList;
    }

    /**
     * Metodo que retorna el resultado de una llamada POST
     *
     * @param urlWS Ruta de la peticion
     * @param request Parametros de la peticion
     * @return List de Map que contiene la respuesta de una peticion POST
     */
    public List<HashMap<String, Object>> getWSResponsePOSTList(String urlWS, HashMap<String, Object> request) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());

        return Arrays.asList(rs.postForObject(urlWS, request, HashMap[].class));
    }
    
    /**
     * Deveulve una lista generica despues de un llamado post
     * @param <B>
     * @param urlWS
     * @param request
     * @param tipo
     * @return 
     */
    public <B> List<B> getWSResponsePOSTGenericList(String urlWS, HashMap<String, Object> request, Class<B[]> tipo) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        return Arrays.asList(rs.postForObject(urlWS, request, tipo));
    }

    /**
     * Metodo que retorna el resultado de una llamada GET
     *
     * @param urlWS Ruta de la peticion
     * @param type tipo del resultado de la peticion (ArrayList o Hashmap)
     * @return ArrayList o Hashmap que contiene la respuesta de una peticion GET
     */
    public Object getWSResponseGET(String urlWS, Object type) {

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());

        return rs.getForObject(urlWS, type.getClass());
    }
    
    /**
     * Metodo que retorna el resultado de una llamada Get
     * haciendo uso de una unica instancia del rest template
     * @param urlWS
     * @param type
     * @return 
     */
    public Object getWSResponseWithFinalRsGET(String urlWS, Object type) {
        return privateRs.getForObject(urlWS, type.getClass());
    }

    /**
     * Metodo que retorna el resultado de una llamada GET
     *
     * @param urlWS Ruta de la peticion
     * @param type tipo del resultado de la peticion (ArrayList o Hashmap)
     * @return ArrayList o Hashmap que contiene la respuesta de una peticion GET
     */
    public Object getWSResponseGETUser(String urlWS, Object type) {

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Content-Type", "application/json");
        HttpEntity<Object> requestEntity = new HttpEntity<Object>(requestHeaders);

        RestTemplate rs = new RestTemplate();
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());

        return rs.exchange(urlWS, HttpMethod.GET, requestEntity, type.getClass()).getBody();
    }
    
    /**
     * Metodo para consultar los eventos de un dispositivo en el tiempo
     * se debe suministrar un hashmap con los parametros para consultar
     * 
     * @param urlHistory
     * @param params
     * @return 
     */
    public List<DeviceEvent> getEventsFromHistory(String urlHistory, HashMap<String, Object> params) {
        List<DeviceEvent> listaEventos = new ArrayList<>();        
        CountDownLatch latch = new CountDownLatch(1);        
        RestTemplate template = new RestTemplate();
        
        client = new ClientExternal("", urlHistory, template);
        
        QueryFilter filter = QueryFilter.HistoryQueryFilter.start()
                .mids((String) params.get("mids"))
                .from((Long) params.get("from"))
                .to((Long) params.get("to"))
                .eids((List<String>) params.get("eids"))
                .get();
        
        client.get(filter)
                .subscribe(
                        event -> {
                            listaEventos.add(event);
                        },
                        error -> {
                            logger.error(error.getMessage());
                            latch.countDown();
                        },
                        () -> latch.countDown()
                );

        while (latch.getCount() > 0) {
            try {
                latch.await(1, TimeUnit.SECONDS);
                logger.info("processing deviceEvent signals ...");
            } catch (InterruptedException ex) {
                logger.error(ex.getMessage());
            }
        }
        
        return listaEventos;        
    }
}
