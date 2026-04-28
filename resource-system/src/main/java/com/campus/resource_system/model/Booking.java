package com.campus.resource_system.model;

public class Booking {
    private String bookingId;
    private String resourceId;
    private String resourceName;
    private String username;
    private String department;
    private String startDate;
    private String endDate;
    private String purpose;
    private String status;    // "PENDING", "APPROVED", "CANCELLED"
    private String createdAt;

    public Booking(String bookingId, String resourceId, String resourceName,
                   String username, String department,
                   String startDate, String endDate,
                   String purpose, String status, String createdAt) {
        this.bookingId    = bookingId;
        this.resourceId   = resourceId;
        this.resourceName = resourceName;
        this.username     = username;
        this.department   = department;
        this.startDate    = startDate;
        this.endDate      = endDate;
        this.purpose      = purpose;
        this.status       = status;
        this.createdAt    = createdAt;
    }

    public String getBookingId()    { return bookingId; }
    public String getResourceId()   { return resourceId; }
    public String getResourceName() { return resourceName; }
    public String getUsername()     { return username; }
    public String getDepartment()   { return department; }
    public String getStartDate()    { return startDate; }
    public String getEndDate()      { return endDate; }
    public String getPurpose()      { return purpose; }
    public String getStatus()       { return status; }
    public String getCreatedAt()    { return createdAt; }

    public void setStatus(String status) { this.status = status; }
}
