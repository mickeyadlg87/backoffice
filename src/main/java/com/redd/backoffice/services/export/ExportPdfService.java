package com.redd.backoffice.services.export;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.codec.Base64;
import com.redd.backoffice.utils.ReportUtils;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

/**
 *
 * @author aleal
 */
@Service
public class ExportPdfService {

    public void exportData(Map<String, Object> data, HttpSession session,
            HttpServletResponse response, String nombreReporte) throws Exception {

        nombreReporte = (String) data.get("title");

        String fecha = new SimpleDateFormat("dd'-'MM'-'yyyy'_'HH:mm")
                .format(new Date());

        nombreReporte = nombreReporte.replaceAll(" ", "_");
        String name = nombreReporte + "_" + fecha + ".pdf";

        try {
            Logger.getRootLogger().info("PDF: " + data.get("title") + " + " + data.get("header"));
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + name + "\"");
//            response.setHeader("Content-Disposition", header);
            nombreReporte = (String) data.get("title");

            String title = (String) data.get("title");
            HashMap<String, Object> detalle = (HashMap<String, Object>) data.get("header");
            ArrayList<HashMap<String, Object>> reportData = (ArrayList<HashMap<String, Object>>) data.get("data");

            //obtiene data extra si es que existe
            ArrayList<HashMap<String, Object>> reportDataExtra = null;

            if (data.containsKey("extra")) {
                reportDataExtra = (ArrayList<HashMap<String, Object>>) data.get("extra");
            }

            Document document = newDocument();
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();
            addMetaData(document, title);
            addTitlePage(document, detalle, title);
            createTable(document, reportData);

            if (reportDataExtra != null) {
                Paragraph preface = new Paragraph();
                addEmptyLine(preface, 1);
                document.add(preface);
                createTable(document, reportDataExtra);
            }

            if (data.containsKey("chartImage")) {
                String chart = (String) data.get("chartImage");
                chart = chart.replaceAll("^data\\:image\\/png\\;base64\\,", "");
                byte[] chartImage = Base64.decode(chart);
                Paragraph preface = new Paragraph();
                addEmptyLine(preface, 1);
                document.add(preface);
                drawGraficos(document, chartImage);
            }

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Entrega documento para pdf con tamaño determinado en A4
     *
     * @return
     */
    protected Document newDocument() {
        return new Document(PageSize.A4);
    }

    // iText allows to add metadata to the PDF which can be viewed in your Adobe
    // Reader
    // under File -> Properties
    private static void addMetaData(Document document, String title) {
        document.addTitle(title);
    }

    private static void addTitlePage(Document document, HashMap<String, Object> detalle, String title)
            throws DocumentException {

        Paragraph preface = new Paragraph();

        Font titleFont = FontFactory.getFont("Calibri Light");
        titleFont.setSize(20.0f);
        titleFont.isBold();

        preface.add(new Paragraph(title, titleFont));

        Font subTitleFont = FontFactory.getFont("Calibri Light");
        subTitleFont.setSize(12.0f);

        addEmptyLine(preface, 1);
        detalle.entrySet().stream().forEach((entry) -> {
            String key = entry.getKey();
            String value = (String) entry.getValue();
            preface.add(new Paragraph(key + ": " + value, subTitleFont));
        });

        addEmptyLine(preface, 1);
        document.add(preface);
    }

    private static void createTable(Document document, ArrayList<HashMap<String, Object>> reportData)
            throws DocumentException {
        int sizeTable = reportData.get(0).size();
        PdfPTable table = new PdfPTable(sizeTable);
        table.setWidthPercentage(100);

        Font titleCellTable = FontFactory.getFont("Calibri Light");
        titleCellTable.setSize(10.0f);
        titleCellTable.setColor(BaseColor.WHITE);

        Iterator dataIterator = null;
        PdfPCell c1;
        dataIterator = reportData.get(0).entrySet().iterator();

        while (dataIterator.hasNext()) {
            Map.Entry pair = (Map.Entry) dataIterator.next();
            c1 = new PdfPCell(new Phrase((String) pair.getKey(), titleCellTable));
            c1.setHorizontalAlignment(Element.ALIGN_CENTER);
            c1.setBackgroundColor(new BaseColor(51, 122, 183));
            table.addCell(c1);
        }
        table.setHeaderRows(1);

        Font CellTable = FontFactory.getFont("Calibri Light");
        CellTable.setSize(8.0f);

        for (HashMap<String, Object> report : reportData) {
            dataIterator = report.entrySet().iterator();
            while (dataIterator.hasNext()) {
                Map.Entry pair = (Map.Entry) dataIterator.next();
                if (pair.getValue() != null) {
                    if (ReportUtils.isDouble(pair.getValue())) {
                        table.addCell(new PdfPCell(new Phrase(String.valueOf((Double) pair.getValue()), CellTable)));
                    } else if (ReportUtils.isInteger(pair.getValue())) {
                        table.addCell(new PdfPCell(new Phrase(String.valueOf((Integer) pair.getValue()), CellTable)));
                    } else {
                        table.addCell(new PdfPCell(new Phrase((String) pair.getValue(), CellTable)));
                    }
                } else {
                    table.addCell(new PdfPCell(new Phrase("", CellTable)));
                }
            }

        }

        document.add(table);

    }

    private void drawGraficos(Document document, byte[] image) throws Exception {

        Image chartImage = Image.getInstance(image);

        float scaler = ((document.getPageSize().getWidth()
                - document.leftMargin() - document.rightMargin() - 0) / chartImage
                .getWidth()) * 100;

        chartImage.scalePercent(scaler);

        document.add(chartImage);
    }

    private static void addEmptyLine(Paragraph paragraph, int number) {
        for (int i = 0; i < number; i++) {
            paragraph.add(new Paragraph(" "));
        }
    }

}
