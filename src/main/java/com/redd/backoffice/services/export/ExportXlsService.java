package com.redd.backoffice.services.export;

import com.itextpdf.text.pdf.codec.Base64;
import com.redd.backoffice.utils.ReportUtils;
import com.redd.backoffice.utils.S3Storage;
import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFDataFormat;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Picture;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.net.URL;
import org.springframework.beans.factory.annotation.Value;

/**
 *
 * @author aleal
 */
@Service
public class ExportXlsService {

    private Workbook workbook;
    
    @Autowired
    private S3Storage s3storage;
    
    @Value("${reports.path}")
    private String reportePath;

    /**
     * Metodo que exporta data preparada a XLS
     *
     * @param data Datos para ser exportados
     * @param session
     * @param response
     * @param nombreReporte
     * @throws java.lang.Exception
     */
    public void exportData(Map<String, Object> data, HttpSession session,
            HttpServletResponse response, String nombreReporte) throws Exception {
        
        Logger.getRootLogger().info("EXCEL: " + data.get("title") + " + " + data.get("header") + " - S3 - " + data.get("s3upload"));

        nombreReporte = (String) data.get("title");
        Boolean s3Upload = data.get("s3upload") != null ? (Boolean) data.get("s3upload") : false;
        String fecha = !s3Upload ? new SimpleDateFormat("dd'-'MM'-'yyyy'_'HH:mm")
                .format(new Date()) : new SimpleDateFormat("ddMMyyyy'_'HHmmss")
                .format(new Date());

        nombreReporte = nombreReporte.replaceAll(" ", "_");
        String name = nombreReporte + "_" + fecha + ".xlsx";

        workbook = new XSSFWorkbook();
        nombreReporte = (String) data.get("title");
        //Obtiene titulo del informe
        String header = (String) data.get("title");

        //obtiene detalle del informe
        HashMap<String, Object> detalle = (HashMap<String, Object>) data.get("header");

        //obtiene data del informe
        ArrayList<HashMap<String, Object>> reportData = (ArrayList<HashMap<String, Object>>) data.get("data");

        //obtiene data extra si es que existe
        ArrayList<HashMap<String, Object>> reportDataExtra = null;

        if (data.containsKey("extra")) {
            reportDataExtra = (ArrayList<HashMap<String, Object>>) data.get("extra");
        }

        Sheet sheet = workbook.createSheet(nombreReporte);

        //Style for header cell
        CellStyle header_style = workbook.createCellStyle();
        header_style.setFillForegroundColor(IndexedColors.AQUA.index);
        header_style.setAlignment(CellStyle.ALIGN_CENTER);
        header_style.setBorderBottom((short) 1);
        header_style.setBorderTop((short) 1);
        header_style.setBorderRight((short) 1);
        header_style.setBorderLeft((short) 1);

        CellStyle sub_title_style = workbook.createCellStyle();
        sub_title_style.setAlignment(CellStyle.ALIGN_LEFT);
        sub_title_style.setBorderBottom((short) 1);
        sub_title_style.setBorderTop((short) 1);
        sub_title_style.setBorderRight((short) 1);
        sub_title_style.setBorderLeft((short) 1);

        CellStyle cellStyleAsDouble = workbook.createCellStyle();
        cellStyleAsDouble.setDataFormat(HSSFDataFormat.getBuiltinFormat("#.#"));
        cellStyleAsDouble.setBorderBottom((short) 1);
        cellStyleAsDouble.setBorderTop((short) 1);
        cellStyleAsDouble.setBorderRight((short) 1);
        cellStyleAsDouble.setBorderLeft((short) 1);
        CellStyle cellStyleAsInteger = workbook.createCellStyle();
        cellStyleAsInteger.setDataFormat(HSSFDataFormat.getBuiltinFormat("0"));
        cellStyleAsInteger.setBorderBottom((short) 1);
        cellStyleAsInteger.setBorderTop((short) 1);
        cellStyleAsInteger.setBorderRight((short) 1);
        cellStyleAsInteger.setBorderLeft((short) 1);

        Row dataRow = null;
        Cell dataCell = null;
        int dataRowIndex = 0;

        dataRow = sheet.createRow(dataRowIndex++);
        dataCell = dataRow.createCell(0);
        dataCell.setCellStyle(header_style);
        dataCell.setCellValue(header);

        for (int i = 1; i < reportData.get(0).size(); i++) {
            dataCell = dataRow.createCell(i);
            dataCell.setCellStyle(header_style);
        }

        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, (reportData.get(0).size() - 1)));

        //Se ingresa descripcion del documento
        Iterator it = detalle.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();

            dataRow = sheet.createRow(dataRowIndex++);
            dataCell = dataRow.createCell(0);
            dataCell.setCellStyle(header_style);
            dataCell.setCellValue(pair.getKey() + "");
            dataCell = dataRow.createCell(1);
            dataCell.setCellStyle(sub_title_style);
            dataCell.setCellValue(pair.getValue() + "");

            for (int i = 2; i < reportData.get(0).size(); i++) {
                dataCell = dataRow.createCell(i);
                dataCell.setCellStyle(sub_title_style);
            }
            sheet.addMergedRegion(new CellRangeAddress(dataRowIndex - 1, dataRowIndex - 1, 1, (reportData.get(0).size() - 1)));
        }

        //Se ingresa body del documento
        dataRow = sheet.createRow(dataRowIndex++);
        dataRow = sheet.createRow(dataRowIndex++);

        //Contador que indica que se debe ingresar header de columnas
//        boolean setHeader = true;
        Iterator dataIterator = null;
//    	int cantidadColumnas = 0;

        dataIterator = reportData.get(0).entrySet().iterator();

        int headerIndexColumn = 0;
        while (dataIterator.hasNext()) {
            Map.Entry pair = (Map.Entry) dataIterator.next();
            dataCell = dataRow.createCell(headerIndexColumn++);
            dataCell.setCellStyle(header_style);
            dataCell.setCellValue(pair.getKey() + "");
        }

        dataRow = sheet.createRow(dataRowIndex++);

        for (HashMap<String, Object> report : reportData) {

            int bodyIndexColumn = 0;
            dataIterator = report.entrySet().iterator();
            while (dataIterator.hasNext()) {

                Map.Entry pair = (Map.Entry) dataIterator.next();
                dataCell = dataRow.createCell(bodyIndexColumn++);

                //Define el tipo de data de la celda para su ingreso
                if (pair.getValue() != null) {
                    if (ReportUtils.isDouble(pair.getValue())) {
                        dataCell.setCellValue(Double.parseDouble(pair.getValue() + ""));
                        dataCell.setCellStyle(cellStyleAsDouble);
                    } else if (ReportUtils.isInteger(pair.getValue())) {
                        dataCell.setCellValue(Integer.parseInt(pair.getValue() + ""));
                        dataCell.setCellStyle(cellStyleAsInteger);
                    } else {
                        dataCell.setCellValue(pair.getValue() + "");
                        dataCell.setCellStyle(sub_title_style);
                    }
                } else {
                    dataCell.setCellValue("");
                    dataCell.setCellStyle(sub_title_style);
                }
            }
            dataRow = sheet.createRow(dataRowIndex++);
        }

        if (reportDataExtra != null) {
            dataRow = sheet.createRow(dataRowIndex++);
            Iterator dataIterator_extra = null;

            dataIterator_extra = reportDataExtra.get(0).entrySet().iterator();

            int headerIndexColumn_extra = 0;
            while (dataIterator_extra.hasNext()) {
                Map.Entry pair = (Map.Entry) dataIterator_extra.next();
                dataCell = dataRow.createCell(headerIndexColumn_extra++);
                dataCell.setCellStyle(header_style);
                dataCell.setCellValue(pair.getKey() + "");
            }

            dataRow = sheet.createRow(dataRowIndex++);

            for (HashMap<String, Object> report : reportDataExtra) {

                int bodyIndexColumn = 0;
                dataIterator = report.entrySet().iterator();
                while (dataIterator.hasNext()) {
                    Map.Entry pair = (Map.Entry) dataIterator.next();

                    dataCell = dataRow.createCell(bodyIndexColumn++);

                    //Define el tipo de data de la celda para su ingreso
                    if (pair.getValue() != null) {
                        if (ReportUtils.isDouble(pair.getValue())) {
                            dataCell.setCellValue(Double.parseDouble(pair.getValue() + ""));
                            dataCell.setCellStyle(cellStyleAsDouble);
                        } else if (ReportUtils.isInteger(pair.getValue())) {
                            dataCell.setCellValue(Integer.parseInt(pair.getValue() + ""));
                            dataCell.setCellStyle(cellStyleAsInteger);
                        } else {
                            dataCell.setCellValue(pair.getValue() + "");
                            dataCell.setCellStyle(sub_title_style);
                        }
                    } else {
                        dataCell.setCellValue("");
                        dataCell.setCellStyle(sub_title_style);
                    }
                }
                dataRow = sheet.createRow(dataRowIndex++);
            }
        }

        if (data.containsKey("chartImage")) {
            String chart = (String) data.get("chartImage");
            chart = chart.replaceAll("^data\\:image\\/png\\;base64\\,", "");
            byte[] chartImage = Base64.decode(chart);
            dibujarGrafico(sheet, chartImage, dataRowIndex);
        }

        int size = (reportDataExtra != null && reportDataExtra.get(0).size() > reportData.get(0).size()) ? reportDataExtra.get(0).size() : reportData.get(0).size();
        for (int i = 0; i < size; i++) {
            workbook.getSheetAt(0).autoSizeColumn(i);
        }
        workbook.getSheetAt(0).setDisplayGridlines(false);
        
        if (s3Upload) {
            try (FileOutputStream outFile = new FileOutputStream(reportePath + "/" + name)) {
                workbook.write(outFile);
            }
            // el reporte no queda guardado en el servidor (true)
            s3storage.write(new File(reportePath + "/" + name), true);
            Logger.getRootLogger().info(name + " -> WRITTEN");
            response.setContentType("text/plain");
            URL download = s3storage.linkToFile(name);
            response.getOutputStream().println(download.toString());

        } else {
            response.setHeader("Content-Disposition", "attachment; filename=\"" + name + "\"");
            workbook.write(response.getOutputStream());
        }
    }

    /**
     * Metodo para dibujar una imagen en el excel
     *
     * @param sheet
     * @param chartImage
     */
    private void dibujarGrafico(Sheet sheet, byte[] chartImage, int dataRowIndex) {

        Workbook wb = sheet.getWorkbook();
        // Adds a picture to the workbook
        int pictureIdx = wb.addPicture(chartImage, Workbook.PICTURE_TYPE_PNG);
        // Returns an object that handles instantiating concrete classes
        CreationHelper helper = wb.getCreationHelper();

        // Creates the top-level drawing patriarch.
        Drawing drawing = sheet.createDrawingPatriarch();

        // Create an anchor that is attached to the worksheet
        ClientAnchor anchor = helper.createClientAnchor();

        // set top-left corner for the image
        anchor.setCol1(0);
        anchor.setRow1(dataRowIndex);

        // Creates a picture
        Picture pict = drawing.createPicture(anchor, pictureIdx);
        // Reset the image to the original size
        pict.resize(0.5);

    }

}
