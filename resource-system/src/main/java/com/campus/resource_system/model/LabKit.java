package com.campus.resource_system.model;

public class LabKit extends Resource {

    public LabKit(String resourceId, String resourceName, String moduleType) {
        super(resourceId, resourceName, "Lab Kit", "Robotics Lab", moduleType, 1);
    }

    public LabKit(String resourceId, String resourceName,
                  String location, String moduleType, int totalQty) {
        super(resourceId, resourceName, "Lab Kit", location, moduleType, totalQty);
    }

    @Override
    public void display() {
        super.display();
        System.out.println(" [Lab Kit — " + getDetail() + "]");
    }
}