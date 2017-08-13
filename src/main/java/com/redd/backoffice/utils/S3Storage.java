package com.redd.backoffice.utils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import com.amazonaws.AmazonClientException;
import com.amazonaws.HttpMethod;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import java.net.URL;
import java.util.Date;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Se usa para administracion de archivos en S3 
 * @author aleal
 */
@Component
public class S3Storage {

    @Value("${aws.user}")
    private String user;
    @Value("${aws.pass}")
    private String pass;
    @Value("${aws.bucket}")
    private String bucket;
    @Value("${aws.timeoutlink}")
    private Integer timeoutlink;

    // runtime
    private BasicAWSCredentials awsCreds;
    private AmazonS3 s3Client;
    
    @PostConstruct
    public void initStorage() {
        awsCreds = new BasicAWSCredentials(user, pass);
        s3Client = new AmazonS3Client(awsCreds);
    }

    /**
     * <p>
     * write.</p>
     *
     * @param input a {@link java.io.File} object.
     * @return a {@link java.lang.String} object.
     * @throws java.io.IOException if any.
     */
    public String write(File input) throws IOException {
        return write(input, false);
    }

    /**
     * <p>
     * write.</p>
     *
     * @param input a {@link java.io.File} object.
     * @param delete a boolean.
     * @return a {@link java.lang.String} object.
     * @throws java.io.IOException if any.
     */
    public String write(File input, boolean delete) throws IOException {
        try {
            s3Client.putObject(bucket, input.getName(), input);
            if (delete && input.exists()) {
                input.delete();
            }
        } catch (AmazonClientException e) {
            throw new IOException("Could not copy key " + input.getName() + " into bucket " + bucket, e);
        } catch (Exception ex) {
            throw new IOException("Exception S3 for " + input.getName() + " into bucket " + bucket, ex);
        }
        return input.getName();
    }

    /**
     * <p>
     * read.</p>
     *
     * @param id a {@link java.lang.String} object.
     * @return a {@link java.io.InputStream} object.
     */
    public InputStream read(String id) {
        S3Object object = s3Client.getObject(new GetObjectRequest(bucket, id));
        InputStream objectData = object.getObjectContent();
        return objectData;
    }
    
    /**
     * return a URL to S3 file
     * @param fileName
     * @return 
     */
    public URL linkToFile(String fileName) {
        Date now = new Date();
        Long expiration = now.getTime() + (timeoutlink * 1000);
        GeneratePresignedUrlRequest presignedUrl = new GeneratePresignedUrlRequest(bucket, fileName, HttpMethod.GET).withExpiration(new Date(expiration));
        return s3Client.generatePresignedUrl(presignedUrl);
    }
    
}

