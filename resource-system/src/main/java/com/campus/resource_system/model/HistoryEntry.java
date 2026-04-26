package com.campus.resource_system.model;

public class HistoryEntry {
    private String timestamp;
    private String action;
    private String resourceId;
    private String resourceName;
    private int    quantity;
    private String department;
    private String note;

    public HistoryEntry(String timestamp, String action,
                        String resourceId, String resourceName,
                        int quantity, String department, String note) {
        this.timestamp    = timestamp;
        this.action       = action;
        this.resourceId   = resourceId;
        this.resourceName = resourceName;
        this.quantity     = quantity;
        this.department   = department;
        this.note         = note;
    }

    public String getTimestamp()    { return timestamp; }
    public String getAction()       { return action; }
    public String getResourceId()   { return resourceId; }
    public String getResourceName() { return resourceName; }
    public int    getQuantity()     { return quantity; }
    public String getDepartment()   { return department; }
    public String getNote()         { return note; }
}