package com.campus.resource_system.model;

public class Projector extends Resource {

    public Projector(String resourceId, String resourceName, String resolution) {
        super(resourceId, resourceName, "Projector", "Seminar Hall", resolution, 1);
    }

    public Projector(String resourceId, String resourceName,
                     String location, String resolution, int totalQty) {
        super(resourceId, resourceName, "Projector", location, resolution, totalQty);
    }

    @Override
    public void display() {
        super.display();
        System.out.println(" [Projector — " + getDetail() + "]");
    }
}