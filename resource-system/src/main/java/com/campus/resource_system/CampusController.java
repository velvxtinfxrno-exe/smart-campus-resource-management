package com.campus.resource_system;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.resource_system.model.Allocation;
import com.campus.resource_system.model.HistoryEntry;
import com.campus.resource_system.model.LabKit;
import com.campus.resource_system.model.Laptop;
import com.campus.resource_system.model.Projector;
import com.campus.resource_system.model.Resource;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CampusController {

    // ── Fixed arrays (OOP + array data structures) ───────────
    private Resource[]     resources   = new Resource[50];
    private Allocation[]   allocations = new Allocation[200];
    private HistoryEntry[] history     = new HistoryEntry[500];

    private int resCount   = 0;
    private int allocCount = 0;
    private int histCount  = 0;

    private static final String ALLOC_FILE   = "allocations.txt";
    private static final String HISTORY_FILE = "history.txt";
    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // ── Seed default resources ────────────────────────────────
    public CampusController() {
        resources[resCount++] = new Projector("P01", "Epson X",      "Main Seminar Hall", "1080p, HDMI",         5);
        resources[resCount++] = new Laptop  ("L01", "Dell XPS",      "Smart Lab",         "16GB RAM, i7",       10);
        resources[resCount++] = new LabKit  ("K01", "Arduino IoT",   "Robotics Lab",      "Sensors + WiFi",      8);
        resources[resCount++] = new Laptop  ("L02", "MacBook Air",   "Digital Library",   "M2, 8GB RAM",         6);
        resources[resCount++] = new Projector("P02","BenQ MH733",   "Conference Room",   "Full HD, 4000 lumens", 3);
        resources[resCount++] = new LabKit  ("K02", "Raspberry Pi",  "Electronics Lab",   "Pi 4, 4GB",           4);
    }

    @PostConstruct
    public void init() {
        loadAllocations();
        loadHistory();
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/resources
    // ════════════════════════════════════════════════════════════
    @GetMapping("/resources")
    public ResponseEntity<List<Map<String, Object>>> getAllResources() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < resCount; i++) {
            list.add(resourceToMap(resources[i]));
        }
        return ResponseEntity.ok(list);
    }

    // ════════════════════════════════════════════════════════════
    // POST /api/allocate?resId=&deptId=&date=&qty=
    // ════════════════════════════════════════════════════════════
    @PostMapping("/allocate")
    public ResponseEntity<String> allocateResource(
            @RequestParam String resId,
            @RequestParam String deptId,
            @RequestParam String date,
            @RequestParam(defaultValue = "1") int qty) {

        Resource target = findResource(resId);
        if (target == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Resource '" + resId + "' not found.");
        if (target.getAvailableQty() < qty)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Only " + target.getAvailableQty() + " unit(s) available.");

        target.allocate(qty);

        String allocId = "A" + (allocCount + 1);
        allocations[allocCount++] = new Allocation(allocId, resId, deptId, date, qty);

        addHistory("ALLOCATE", target, qty, deptId,
                "Allocated " + qty + " unit(s) to " + deptId + " on " + date);
        saveAllocations();
        saveHistory();

        return ResponseEntity.ok(
                "Success: " + qty + " unit(s) of '" + target.getResourceName()
                        + "' allocated to " + deptId + ".");
    }

    // ════════════════════════════════════════════════════════════
    // POST /api/release?resId=&qty=
    // ════════════════════════════════════════════════════════════
    @PostMapping("/release")
    public ResponseEntity<String> releaseResource(
            @RequestParam String resId,
            @RequestParam(defaultValue = "1") int qty) {

        Resource target = findResource(resId);
        if (target == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Resource '" + resId + "' not found.");
        if (target.getAllocatedQty() < qty)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Only " + target.getAllocatedQty()
                            + " unit(s) are currently allocated.");

        target.release(qty);

        // Remove matching allocation entries
        removeAllocations(resId, qty);
        addHistory("RELEASE", target, qty, "",
                "Released " + qty + " unit(s) of " + target.getResourceName());
        saveAllocations();
        saveHistory();

        return ResponseEntity.ok(
                "Success: " + qty + " unit(s) of '"
                        + target.getResourceName() + "' released.");
    }

    // ════════════════════════════════════════════════════════════
    // POST /api/resources/add
    // ════════════════════════════════════════════════════════════
    @PostMapping("/resources/add")
    public ResponseEntity<String> addResource(
            @RequestParam String name,
            @RequestParam(defaultValue = "General") String type,
            @RequestParam(defaultValue = "Campus")  String location,
            @RequestParam(defaultValue = "")         String detail,
            @RequestParam(defaultValue = "1")        int totalQty) {

        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().body("Error: Name is required.");
        if (resCount >= resources.length)
            return ResponseEntity.badRequest().body("Error: Resource limit reached.");

        String id = generateId(type);
        Resource r = new Resource(id, name.trim(), type, location, detail, totalQty);
        resources[resCount++] = r;
        addHistory("ADD", r, totalQty, "", "Resource added by admin");
        saveHistory();

        return ResponseEntity.ok("Success: Resource '" + name + "' added with ID " + id + ".");
    }

    // ════════════════════════════════════════════════════════════
    // POST /api/resources/update
    // ════════════════════════════════════════════════════════════
    @PostMapping("/resources/update")
    public ResponseEntity<String> updateResource(
            @RequestParam String resId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String detail,
            @RequestParam(required = false) Integer totalQty) {

        Resource target = findResource(resId);
        if (target == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Resource '" + resId + "' not found.");

        if (name     != null && !name.isBlank())     target.setResourceName(name.trim());
        if (type     != null && !type.isBlank())     target.setType(type.trim());
        if (location != null && !location.isBlank()) target.setLocation(location.trim());
        if (detail   != null)                         target.setDetail(detail.trim());
        if (totalQty != null && totalQty > 0)         target.setTotalQty(totalQty);

        addHistory("UPDATE", target, 0, "", "Resource updated by admin");
        saveHistory();

        return ResponseEntity.ok("Success: Resource '" + resId + "' updated.");
    }

    // ════════════════════════════════════════════════════════════
    // POST /api/resources/delete
    // ════════════════════════════════════════════════════════════
    @PostMapping("/resources/delete")
    public ResponseEntity<String> deleteResource(@RequestParam String resId) {
        int idx = findIndex(resId);
        if (idx < 0)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Resource '" + resId + "' not found.");
        if (resources[idx].getAllocatedQty() > 0)
            return ResponseEntity.badRequest()
                    .body("Error: Cannot delete — resource has active allocations.");

        String name = resources[idx].getResourceName();
        // Shift array left
        for (int i = idx; i < resCount - 1; i++) resources[i] = resources[i + 1];
        resources[--resCount] = null;

        // Remove allocations for this resource
        removeAllAllocations(resId);
        saveAllocations();
        saveHistory();

        return ResponseEntity.ok("Success: Resource '" + name + "' deleted.");
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/history
    // ════════════════════════════════════════════════════════════
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory() {
        List<Map<String, Object>> list = new ArrayList<>();
        // Return newest first
        for (int i = histCount - 1; i >= 0; i--) {
            HistoryEntry e = history[i];
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("timestamp",    e.getTimestamp());
            m.put("action",       e.getAction());
            m.put("resourceId",   e.getResourceId());
            m.put("resourceName", e.getResourceName());
            m.put("quantity",     e.getQuantity());
            m.put("department",   e.getDepartment());
            m.put("note",         e.getNote());
            list.add(m);
        }
        return ResponseEntity.ok(list);
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/insights
    // ════════════════════════════════════════════════════════════
    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights() {
        int totalUnits     = 0, availableUnits = 0, allocatedUnits = 0, lowStock = 0;
        Map<String, Integer> typeCounts = new LinkedHashMap<>();

        for (int i = 0; i < resCount; i++) {
            Resource r = resources[i];
            totalUnits     += r.getTotalQty();
            availableUnits += r.getAvailableQty();
            allocatedUnits += r.getAllocatedQty();
            if ("Low Stock".equals(r.getStatus())) lowStock++;
            typeCounts.merge(r.getType(), 1, Integer::sum);
        }

        // Category summary list
        List<Map<String, Object>> categories = new ArrayList<>();
        typeCounts.forEach((type, count) -> {
            Map<String, Object> cat = new LinkedHashMap<>();
            cat.put("name", type);
            cat.put("count", count);
            categories.add(cat);
        });

        // Top utilization (most allocated %)
        List<Map<String, Object>> utilization = new ArrayList<>();
        for (int i = 0; i < resCount; i++) {
            Resource r = resources[i];
            if (r.getTotalQty() == 0) continue;
            int pct = (int) Math.round((double) r.getAllocatedQty() / r.getTotalQty() * 100);
            Map<String, Object> u = new LinkedHashMap<>();
            u.put("name", r.getResourceName());
            u.put("id",   r.getResourceId());
            u.put("utilizationPct", pct);
            utilization.add(u);
        }
        utilization.sort((a, b) ->
                (int) b.get("utilizationPct") - (int) a.get("utilizationPct"));

        // Stats map
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("resourceCount",  resCount);
        stats.put("totalUnits",     totalUnits);
        stats.put("availableUnits", availableUnits);
        stats.put("allocatedUnits", allocatedUnits);
        stats.put("lowStock",       lowStock);
        stats.put("activeAllocs",   allocCount);
        stats.put("historyCount",   histCount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("stats",       stats);
        result.put("categories",  categories);
        result.put("utilization", utilization);
        return ResponseEntity.ok(result);
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/report  — plain text download
    // ════════════════════════════════════════════════════════════
    @GetMapping("/report")
    public ResponseEntity<String> getReport() {
        StringBuilder sb = new StringBuilder();
        sb.append("═══════════════════════════════════════════\n");
        sb.append("  SMART CAMPUS RESOURCE MANAGEMENT REPORT\n");
        sb.append("  Generated: ").append(LocalDateTime.now().format(TS)).append("\n");
        sb.append("═══════════════════════════════════════════\n\n");

        sb.append("RESOURCES (").append(resCount).append(" total)\n");
        sb.append("─────────────────────────────────────────\n");
        for (int i = 0; i < resCount; i++) {
            Resource r = resources[i];
            sb.append(String.format("%-6s %-22s %-14s %-20s  %d/%d units  [%s]\n",
                    r.getResourceId(), r.getResourceName(), r.getType(),
                    r.getLocation(), r.getAvailableQty(), r.getTotalQty(),
                    r.getStatus()));
        }

        sb.append("\nACTIVE ALLOCATIONS (").append(allocCount).append(")\n");
        sb.append("─────────────────────────────────────────\n");
        for (int i = 0; i < allocCount; i++) {
            Allocation a = allocations[i];
            sb.append(String.format("%-6s → %-10s  Dept: %-10s  Date: %s  Qty: %d\n",
                    a.getAllocationId(), a.getResourceId(),
                    a.getDepartmentId(), a.getDate(), a.getQuantity()));
        }

        sb.append("\nRECENT HISTORY (last 20)\n");
        sb.append("─────────────────────────────────────────\n");
        int start = Math.max(0, histCount - 20);
        for (int i = histCount - 1; i >= start; i--) {
            HistoryEntry h = history[i];
            sb.append(String.format("[%s] %-8s %-6s %-20s qty=%d  %s\n",
                    h.getTimestamp(), h.getAction(), h.getResourceId(),
                    h.getResourceName(), h.getQuantity(), h.getNote()));
        }

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=campus-report.txt")
                .header("Content-Type", "text/plain; charset=utf-8")
                .body(sb.toString());
    }

    // ════════════════════════════════════════════════════════════
    // Internal helpers
    // ════════════════════════════════════════════════════════════

    private Resource findResource(String id) {
        for (int i = 0; i < resCount; i++)
            if (resources[i].getResourceId().equals(id)) return resources[i];
        return null;
    }

    private int findIndex(String id) {
        for (int i = 0; i < resCount; i++)
            if (resources[i].getResourceId().equals(id)) return i;
        return -1;
    }

    private String generateId(String type) {
        String prefix = "R";
        if (type != null) {
            String t = type.trim().toLowerCase();
            if (t.contains("projector"))  prefix = "P";
            else if (t.contains("laptop")) prefix = "L";
            else if (t.contains("lab"))    prefix = "K";
            else if (t.contains("tablet")) prefix = "T";
        }
        int max = 0;
        for (int i = 0; i < resCount; i++) {
            String rid = resources[i].getResourceId();
            if (rid.startsWith(prefix)) {
                try { max = Math.max(max, Integer.parseInt(rid.substring(1))); }
                catch (NumberFormatException ignored) {}
            }
        }
        return prefix + String.format("%02d", max + 1);
    }

    private void addHistory(String action, Resource r, int qty,
                            String dept, String note) {
        if (histCount >= history.length) {
            // Shift out oldest 50
            System.arraycopy(history, 50, history, 0, history.length - 50);
            histCount -= 50;
        }
        history[histCount++] = new HistoryEntry(
                LocalDateTime.now().format(TS),
                action,
                r.getResourceId(),
                r.getResourceName(),
                qty, dept, note);
    }

    private void removeAllocations(String resId, int qty) {
        int removed = 0;
        for (int i = allocCount - 1; i >= 0 && removed < qty; i--) {
            if (allocations[i].getResourceId().equals(resId)) {
                for (int k = i; k < allocCount - 1; k++)
                    allocations[k] = allocations[k + 1];
                allocations[--allocCount] = null;
                removed++;
            }
        }
    }

    private void removeAllAllocations(String resId) {
        int i = 0;
        while (i < allocCount) {
            if (allocations[i].getResourceId().equals(resId)) {
                for (int k = i; k < allocCount - 1; k++)
                    allocations[k] = allocations[k + 1];
                allocations[--allocCount] = null;
            } else i++;
        }
    }

    // ── File I/O ──────────────────────────────────────────────

    private void saveAllocations() {
        try (PrintWriter w = new PrintWriter(new FileWriter(ALLOC_FILE))) {
            for (int i = 0; i < allocCount; i++) {
                Allocation a = allocations[i];
                w.println(a.getAllocationId() + "," + a.getResourceId() + ","
                        + a.getDepartmentId() + "," + a.getDate()
                        + "," + a.getQuantity());
            }
        } catch (IOException ignored) {}
    }

    private void loadAllocations() {
        File f = new File(ALLOC_FILE);
        if (!f.exists()) return;
        try (BufferedReader r = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = r.readLine()) != null && allocCount < allocations.length) {
                String[] p = line.split(",", 5);
                if (p.length < 4) continue;
                int qty = p.length >= 5 ? parseIntSafe(p[4]) : 1;
                allocations[allocCount++] = new Allocation(p[0], p[1], p[2], p[3], qty);
                Resource res = findResource(p[1]);
                if (res != null) res.allocate(qty);
            }
        } catch (IOException ignored) {}
    }

    private void saveHistory() {
        try (PrintWriter w = new PrintWriter(new FileWriter(HISTORY_FILE))) {
            for (int i = 0; i < histCount; i++) {
                HistoryEntry h = history[i];
                w.println(h.getTimestamp() + "|" + h.getAction() + "|"
                        + h.getResourceId() + "|" + h.getResourceName() + "|"
                        + h.getQuantity() + "|" + h.getDepartment() + "|" + h.getNote());
            }
        } catch (IOException ignored) {}
    }

    private void loadHistory() {
        File f = new File(HISTORY_FILE);
        if (!f.exists()) return;
        try (BufferedReader r = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = r.readLine()) != null && histCount < history.length) {
                String[] p = line.split("\\|", 7);
                if (p.length < 7) continue;
                history[histCount++] = new HistoryEntry(
                        p[0], p[1], p[2], p[3],
                        parseIntSafe(p[4]), p[5], p[6]);
            }
        } catch (IOException ignored) {}
    }

    private int parseIntSafe(String s) {
        try { return Integer.parseInt(s.trim()); }
        catch (Exception e) { return 1; }
    }

    private Map<String, Object> resourceToMap(Resource r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("resourceId",   r.getResourceId());
        m.put("resourceName", r.getResourceName());
        m.put("type",         r.getType());
        m.put("location",     r.getLocation());
        m.put("detail",       r.getDetail());
        m.put("totalQty",     r.getTotalQty());
        m.put("availableQty", r.getAvailableQty());
        m.put("allocatedQty", r.getAllocatedQty());
        m.put("available",    r.isAvailable());
        m.put("status",       r.getStatus());
        return m;
    }
}