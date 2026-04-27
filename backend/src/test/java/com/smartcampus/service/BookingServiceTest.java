package com.smartcampus.service;

import com.smartcampus.dto.request.CreateBookingRequest;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private UserPrincipal userPrincipal;
    private Resource resource;
    private CreateBookingRequest createRequest;

    @BeforeEach
    void setUp() {
        userPrincipal = UserPrincipal.builder()
            .id("user-1").name("John Doe").email("john@example.com").role("STUDENT").build();

        resource = Resource.builder()
            .id("res-1").name("Lab A").type("ROOM").status(ResourceStatus.ACTIVE).build();

        createRequest = new CreateBookingRequest();
        createRequest.setResourceId("res-1");
        createRequest.setStartTime(LocalDateTime.now().plusDays(1));
        createRequest.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        createRequest.setPurpose("Study");
    }

    @Test
    void createBooking_Success() {
        when(resourceRepository.findById("res-1")).thenReturn(Optional.of(resource));
        when(bookingRepository.findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            anyString(), any(), any(), any())).thenReturn(java.util.Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking result = bookingService.createBooking(createRequest, userPrincipal);

        assertNotNull(result);
        assertEquals("Lab A", result.getResourceName());
        assertEquals("user-1", result.getUserId());
        assertEquals(BookingStatus.PENDING, result.getStatus());
        verify(notificationService).createNotification(anyString(), any(), anyString(), any());
    }

    @Test
    void createBooking_ResourceNotFound_ThrowsException() {
        when(resourceRepository.findById("res-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bookingService.createBooking(createRequest, userPrincipal));
    }

    @Test
    void approveBooking_Success() {
        Booking booking = Booking.builder().id("book-1").userId("user-1").resourceName("Lab A").status(BookingStatus.PENDING).build();
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        Booking result = bookingService.approveBooking("book-1");

        assertEquals(BookingStatus.APPROVED, result.getStatus());
        verify(notificationService).createNotification(eq("user-1"), eq(NotificationType.BOOKING_APPROVED), anyString(), eq("book-1"));
    }
}
