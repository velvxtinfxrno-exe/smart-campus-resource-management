package com.campus.resource_system.model;

public class Laptop extends Resource {
    private String specs;

    public Laptop(String resourceId, String resourceName, String specs) {
        super(resourceId, resourceName);
        this.specs = specs;
    }

    @Override
    public void display() {
        super.display();
        System.out.printf(" | Specs: %s\n", specs);
    }
}