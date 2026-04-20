package com.smartcampus.hub.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Slf4j
@Service
public class QrCodeService {

    public String generateQrCode(String bookingId) {
        try {
            String content = "SMART_CAMPUS_BOOKING:" + bookingId;
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOut);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngOut.toByteArray());
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code for booking {}: {}", bookingId, e.getMessage());
            return null;
        }
    }
}
