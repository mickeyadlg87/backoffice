package com.redd.backoffice.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

@SuppressWarnings({"unchecked", "rawtypes"})
public class WsPetitionRunnable implements Runnable {

    private static final Logger logger = LoggerFactory.getLogger(WsPetitionRunnable.class);

    private HashMap<String, Object> request;
    RestTemplate rs;
    String url;
    List vehicleFullList;
    int type;

    public WsPetitionRunnable(HashMap<String, Object> req, RestTemplate rest, List vehicleFullList, String url, int type) {
        super();
        request = req;
        rs = rest;
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.url = url;
        this.vehicleFullList = vehicleFullList;
        this.type = type;
    }

    @Override
    public void run() {
        rs.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        try {
            System.out.println(request.toString());
            if (vehicleFullList != null) {
                if (type == 1) {
                    vehicleFullList.add(rs.postForObject(url, request, HashMap.class));
                } else if (type == 2) {
                    vehicleFullList.add(rs.postForObject(url, request, ArrayList.class));
                }
            }
        } catch (Exception e) {
            if (type == 1) {
                vehicleFullList.add(new HashMap());
            } else if (type == 2) {
                vehicleFullList.add(new ArrayList());
            }
            logger.info("", e);
        }
    }
}
