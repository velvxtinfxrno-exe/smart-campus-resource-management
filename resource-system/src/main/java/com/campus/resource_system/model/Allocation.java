package com.campus.resource_system.model;

public class Allocation {
    private String allocationId;
    private String resourceId;
    private String departmentId;
    private String date;
    private int    quantity;

    // Full constructor
    public Allocation(String allocationId, String resourceId,
                      String departmentId, String date, int quantity) {
        this.allocationId = allocationId;
        this.resourceId   = resourceId;
        this.departmentId = departmentId;
        this.date         = date;
        this.quantity     = Math.max(1, quantity);
    }

    // Legacy 4-arg constructor — keeps old save/load code working
    public Allocation(String allocationId, String resourceId,
                      String departmentId, String date) {
        this(allocationId, resourceId, departmentId, date, 1);
    }

    public String getAllocationId()  { return allocationId; }
    public String getResourceId()    { return resourceId; }
    public String getDepartmentId()  { return departmentId; }
    public String getDate()          { return date; }
    public int    getQuantity()      { return quantity; }
}