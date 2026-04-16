package com.campus.resource_system;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.resource_system.model.Allocation;
import com.campus.resource_system.model.Department;
import com.campus.resource_system.model.LabKit;
import com.campus.resource_system.model.Laptop;
import com.campus.resource_system.model.Projector;
import com.campus.resource_system.model.Resource;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // <--- THIS ALLOWS VERCEL TO CONNECT
public class CampusController {

    private Resource[] resources = new Resource[50];
    private Department[] departments = new Department[20];
    private Allocation[] allocations = new Allocation[100];
    
    private int resCount = 0;
    private int deptCount = 0;
    private int allocCount = 0;

    private final String DATA_FILE = "allocations.txt";

    public CampusController() {
        departments[deptCount++] = new Department("D01", "Computer Science");
        departments[deptCount++] = new Department("D02", "Electronics");

        resources[resCount++] = new Projector("P01", "Epson X", "1080p");
        resources[resCount++] = new Laptop("L01", "Dell XPS", "16GB RAM, i7");
        resources[resCount++] = new LabKit("K01", "Arduino IoT", "Sensors");
    }

    @PostConstruct
    public void init() {
        loadAllocations();
    }

    @GetMapping("/resources")
    public ResponseEntity<List<Resource>> getAllResources() {
        List<Resource> activeResources = new ArrayList<>();
        for (int i = 0; i < resCount; i++) {
            activeResources.add(resources[i]);
        }
        return ResponseEntity.ok(activeResources);
    }

    @PostMapping("/allocate")
    public ResponseEntity<String> allocateResource(@RequestParam String resId, @RequestParam String deptId, @RequestParam String date) {
        Resource targetRes = null;
        for (int i = 0; i < resCount; i++) {
            if (resources[i].getResourceId().equals(resId)) {
                targetRes = resources[i];
                break;
            }
        }

        if (targetRes == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Resource not found.");
        }
        if (!targetRes.isAvailable()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Resource already allocated.");
        }

        targetRes.allocate();
        String allocId = "A" + (allocCount + 1);
        allocations[allocCount++] = new Allocation(allocId, resId, deptId, date);
        
        saveAllocations();
        
        return ResponseEntity.ok("Success: Resource allocated to " + deptId);
    }

    @PostMapping("/release")
    public ResponseEntity<String> releaseResource(@RequestParam String resId) {
        for (int i = 0; i < resCount; i++) {
            if (resources[i].getResourceId().equals(resId)) {
                if (!resources[i].isAvailable()) {
                    resources[i].release();
                    
                    for (int j = 0; j < allocCount; j++) {
                        if (allocations[j].getResourceId().equals(resId)) {
                            for (int k = j; k < allocCount - 1; k++) {
                                allocations[k] = allocations[k + 1];
                            }
                            allocations[allocCount - 1] = null;
                            allocCount--;
                            break;
                        }
                    }
                    saveAllocations();
                    return ResponseEntity.ok("Success: Resource released.");
                }
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Resource was not allocated.");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Resource not found.");
    }

    private void saveAllocations() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(DATA_FILE))) {
            for (int i = 0; i < allocCount; i++) {
                Allocation a = allocations[i];
                writer.println(a.getAllocationId() + "," + a.getResourceId() + "," + a.getDepartmentId() + "," + a.getDate());
            }
        } catch (IOException ignored) {}
    }

    private void loadAllocations() {
        File file = new File(DATA_FILE);
        if (!file.exists()) return;

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 4) {
                    allocations[allocCount++] = new Allocation(parts[0], parts[1], parts[2], parts[3]);
                    for (int i = 0; i < resCount; i++) {
                        if (resources[i].getResourceId().equals(parts[1])) {
                            resources[i].allocate();
                            break;
                        }
                    }
                }
            }
        } catch (IOException ignored) {}
    }
}