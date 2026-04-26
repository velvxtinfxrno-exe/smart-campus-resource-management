package com.campus.resource_system.model;

public class Resource {
    private String resourceId;
    private String resourceName;
    private String type;
    private String location;
    private String detail;
    private int totalQty;
    private int availableQty;
    private boolean isAvailable;

    // Original 2-arg constructor — keeps backward compatibility
    public Resource(String resourceId, String resourceName) {
        this(resourceId, resourceName, "General", "Campus", "", 1);
    }

    // Full constructor
    public Resource(String resourceId, String resourceName,
                    String type, String location, String detail, int totalQty) {
        this.resourceId   = resourceId;
        this.resourceName = resourceName;
        this.type         = type == null ? "General" : type;
        this.location     = location == null ? "Campus" : location;
        this.detail       = detail == null ? "" : detail;
        this.totalQty     = Math.max(1, totalQty);
        this.availableQty = this.totalQty;
        this.isAvailable  = true;
    }

    // ── Getters ──────────────────────────────────────────────
    public String getResourceId()   { return resourceId; }
    public String getResourceName() { return resourceName; }
    public String getType()         { return type; }
    public String getLocation()     { return location; }
    public String getDetail()       { return detail; }
    public int    getTotalQty()     { return totalQty; }
    public int    getAvailableQty() { return availableQty; }
    public int    getAllocatedQty()  { return totalQty - availableQty; }
    public boolean isAvailable()    { return availableQty > 0; }

    // Status label — mirrors Ultimate's logic
    public String getStatus() {
        if (availableQty <= 0) return "Fully Allocated";
        int threshold = Math.max(1, (int) Math.ceil(totalQty * 0.2));
        if (availableQty <= threshold) return "Low Stock";
        return "Available";
    }

    // ── Setters ──────────────────────────────────────────────
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public void setType(String type)                 { this.type = type; }
    public void setLocation(String location)         { this.location = location; }
    public void setDetail(String detail)             { this.detail = detail; }
    public void setTotalQty(int totalQty) {
        this.totalQty     = Math.max(1, totalQty);
        this.availableQty = Math.min(this.availableQty, this.totalQty);
    }

    // ── Actions ──────────────────────────────────────────────
    public boolean allocate(int qty) {
        if (qty <= 0 || qty > availableQty) return false;
        availableQty -= qty;
        isAvailable   = availableQty > 0;
        return true;
    }

    // Legacy single-unit allocate — keeps existing callers working
    public void allocate() {
        allocate(1);
    }

    public boolean release(int qty) {
        if (qty <= 0) return false;
        availableQty = Math.min(totalQty, availableQty + qty);
        isAvailable  = availableQty > 0;
        return true;
    }

    // Legacy single-unit release
    public void release() {
        release(1);
    }

    public void display() {
        String status = isAvailable() ? "Available" : "Allocated";
        System.out.printf("%-10s | %-20s | %-15s | %-12s | %-20s%n",
                resourceId, resourceName, status, type, location);
    }
}