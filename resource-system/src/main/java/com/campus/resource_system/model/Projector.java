package com.campus.resource_system.model;

public class Projector extends Resource {
    private String resolution;

    public Projector(String resourceId, String resourceName, String resolution) {
        super(resourceId, resourceName);
        this.resolution = resolution;
    }

    @Override
    public void display() {
        super.display();
        System.out.printf(" | Resolution: %s\n", resolution);
    }
}