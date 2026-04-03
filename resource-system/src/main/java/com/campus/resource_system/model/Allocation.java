package com.campus.resource_system.model;

public class Allocation {
    private String allocationId;
    private String resourceId;
    private String departmentId;
    private String date;

    public Allocation(String allocationId, String resourceId, String departmentId, String date) {
        this.allocationId = allocationId;
        this.resourceId = resourceId;
        this.departmentId = departmentId;
        this.date = date;
    }

    public String getAllocationId() {
        return allocationId;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public String getDate() {
        return date;
    }
}