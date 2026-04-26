package com.campus.resource_system.model;

public class Laptop extends Resource {

    public Laptop(String resourceId, String resourceName, String specs) {
        super(resourceId, resourceName, "Laptop", "Smart Lab", specs, 1);
    }

    public Laptop(String resourceId, String resourceName,
                  String location, String specs, int totalQty) {
        super(resourceId, resourceName, "Laptop", location, specs, totalQty);
    }

    @Override
    public void display() {
        super.display();
        System.out.println(" [Laptop — " + getDetail() + "]");
    }
}