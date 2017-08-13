package com.redd.backoffice.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Obtiene las variables configuradas en el application
 *
 * @author aleal
 */
@Component
public class PropertiesReaderUtil {

    @Value("${url.service.companyService}")
    private String urlServiceCompany;
    @Value("${url.service.userService}")
    private String urlServiceUser;
    @Value("${url.service.authService}")
    private String urlServiceAuthorization;
    @Value("${url.service.vehicleService}")
    private String urlServiceVehicle;
    @Value("${url.backoffice.eventService}")
    private String urlServiceEvent;
    @Value("${url.backoffice.deviceService}")
    private String urlServiceDevices;
    @Value("${clientview.limit}")
    private Integer limitForGet;
    @Value("${clientview.offset}")
    private Integer offsetForGet;
    @Value("${reportview.limit}")
    private Integer limitForGetReport;
    @Value("${reportview.offset}")
    private Integer offsetForGetReport;
    @Value("${deviceview.limit}")
    private Integer limitDeviceForGet;
    @Value("${deviceview.offset}")
    private Integer offsetDeviceForGet;
    @Value("${unitview.limit}")
    private Integer limitUnitForGet;
    @Value("${unitview.offset}")
    private Integer offsetUnitForGet;
    @Value("${quantityForCompany.limit}")
    private Integer limitQuantityForCompany;
    @Value("${quantityForCompany.offset}")
    private Integer offsetQuantityForCompany;
    @Value("${url.service.history}")
    private String urlServiceHistory;
    @Value("${url.backoffice.accesssoryService}")
    private String urlServiceAccessories;
    @Value("${url.backoffice.reportService}")
    private String urlServiceReport;    
    @Value("${url.backoffice.potaService}")
    private String urlServicePotaCommand;
    @Value("${url.backoffice.customerService}")
    private String urlCustomerService;
    @Value("${url.backoffice.userService}")
    private String urlUserBckService;
    @Value("${url.backoffice.parameterService}")
    private String urlParamService;

    public String getUrlParamService() {
        return urlParamService;
    }

    public String getUrlCustomerService() {
        return urlCustomerService;
    }

    public String getUrlUserBckService() {
        return urlUserBckService;
    }
    
    public Integer getLimitUnitForGet() {
        return limitUnitForGet;
    }

    public Integer getOffsetUnitForGet() {
        return offsetUnitForGet;
    }
    
    public String getUrlServiceReport() {
        return urlServiceReport;
    }
 
    public String getUrlServiceAccessories(){
        return urlServiceAccessories; 
    }
    
    public String getUrlServiceVehicle() {
        return urlServiceVehicle;
    }

    public String getUrlServiceHistory() {
        return urlServiceHistory;
    }

    public void setUrlServiceHistory(String urlServiceHistory) {
        this.urlServiceHistory = urlServiceHistory;
    }
    
    public Integer getLimitDeviceForGet() {
        return limitDeviceForGet;
    }
    
    public Integer getLimitQuantityForCompany() {
        return limitQuantityForCompany;
    }

    public Integer getOffsetQuantityForCompany() {
        return offsetQuantityForCompany;
    }

    public void setLimitDeviceForGet(Integer limitDeviceForGet) {
        this.limitDeviceForGet = limitDeviceForGet;
    }

    public Integer getOffsetDeviceForGet() {
        return offsetDeviceForGet;
    }

    public void setOffsetDeviceForGet(Integer offsetDeviceForGet) {
        this.offsetDeviceForGet = offsetDeviceForGet;
    }

    public String getUrlServiceCompany() {
        return urlServiceCompany;
    }

    public String getUrlServiceUser() {
        return urlServiceUser;
    }

    public Integer getLimitForGet() {
        return limitForGet;
    }
    
    public Integer getLimitForGetReport() {
        return limitForGetReport;
    }

    public Integer getOffsetForGetReport() {
        return offsetForGetReport;
    }

    public Integer getOffsetForGet() {
        return offsetForGet;
    }

    public String getUrlServiceEvent() {
        return urlServiceEvent;
    }

    public String getUrlServiceDevices() {
        return urlServiceDevices;
    }

    public String getUrlServiceAuthorization() {
        return urlServiceAuthorization;
    }

    public String getUrlServicePotaCommand() {
        return urlServicePotaCommand;
    }
    
}
