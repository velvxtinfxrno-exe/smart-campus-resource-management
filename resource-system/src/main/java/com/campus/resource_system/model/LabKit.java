package com.campus.resource_system.model;

public class LabKit extends Resource {
    private String moduleType;

    public LabKit(String resourceId, String resourceName, String moduleType) {
        super(resourceId, resourceName);
        this.moduleType = moduleType;
    }

    @Override
    public void display() {
        super.display();
        System.out.printf(" | Module: %s\n", moduleType);
    }
}