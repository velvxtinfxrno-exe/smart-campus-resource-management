package com.campus.resource_system.model;

public class Resource {
    private String resourceId;
    private String resourceName;
    private boolean isAvailable;

    public Resource(String resourceId, String resourceName) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.isAvailable = true;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void allocate() {
        this.isAvailable = false;
    }

    public void release() {
        this.isAvailable = true;
    }

    public void display() {
        String status = isAvailable ? "Available" : "Allocated";
        System.out.printf("%-10s | %-20s | %-15s", resourceId, resourceName, status);
    }
}