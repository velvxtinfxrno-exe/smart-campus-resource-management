package com.campus.resource_system;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin; // <--- ADDED IMPORT
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.resource_system.model.Allocation;
import com.campus.resource_system.model.Booking;
import com.campus.resource_system.model.HistoryEntry;
import com.campus.resource_system.model.LabKit;
import com.campus.resource_system.model.Laptop;
import com.campus.resource_system.model.Projector;
import com.campus.resource_system.model.Resource;
import com.campus.resource_system.model.User;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://smart-campus-resource-management-six.vercel.app", allowCredentials = "true") // <--- ADDED SECURITY BYPASS
public class CampusController {

    // ── Fixed arrays (OOP + array data structures) ─────────────
    private Resource[]     resources   = new Resource[50];
    private Allocation[]   allocations = new Allocation[200];
    private HistoryEntry[] history     = new HistoryEntry[500];
    private User[]         users       = new User[100];
    private Booking[]      bookings    = new Booking[300];

    private int resCount  = 0, allocCount = 0, histCount  = 0;
    private int userCount = 0, bookCount  = 0;

    private static final String ALLOC_FILE    = "allocations.txt";
    private static final String HISTORY_FILE  = "history.txt";
    private static final String USERS_FILE    = "users.txt";
    private static final String BOOKINGS_FILE = "bookings.txt";
    private static final String SESSION_COOKIE = "campus_session";

    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // ── Seed default resources ──────────────────────────────────
    public CampusController() {
        resources[resCount++] = new Projector("P01","Epson X",       "Main Seminar Hall","1080p, HDMI",         5);
        resources[resCount++] = new Laptop  ("L01","Dell XPS",       "Smart Lab",        "16GB RAM, i7",       10);
        resources[resCount++] = new LabKit  ("K01","Arduino IoT",    "Robotics Lab",     "Sensors + WiFi",      8);
        resources[resCount++] = new Laptop  ("L02","MacBook Air",    "Digital Library",  "M2, 8GB RAM",         6);
        resources[resCount++] = new Projector("P02","BenQ MH733",   "Conference Room",  "Full HD, 4000 lumens", 3);
        resources[resCount++] = new LabKit  ("K02","Raspberry Pi",  "Electronics Lab",  "Pi 4, 4GB",            4);
    }

    @PostConstruct
    public void init() {
        loadUsers();
        loadAllocations();
        loadHistory();
        loadBookings();
        // Seed default admin if no users exist
        if (userCount == 0) {
            users[userCount++] = new User("admin", hash("admin123"),
                    "Administrator", "IT Department", "ADMIN");
            users[userCount++] = new User("student1", hash("pass123"),
                    "Alex Johnson", "Computer Science", "STUDENT");
            saveUsers();
        }
    }

    // ════════════════════════════════════════════════════════════
    // AUTH — /api/signup  /api/login  /api/logout  /api/me
    // ════════════════════════════════════════════════════════════

    @PostMapping("/signup")
    public ResponseEntity<Map<String,Object>> signup(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(defaultValue = "") String fullName,
            @RequestParam(defaultValue = "") String department,
            @RequestParam(defaultValue = "STUDENT") String role,
            HttpServletResponse response) {

        if (username == null || username.isBlank())
            return fail("Username is required.");
        if (password == null || password.length() < 4)
            return fail("Password must be at least 4 characters.");
        if (findUser(username) != null)
            return fail("Username already taken.");
        if (userCount >= users.length)
            return fail("User limit reached.");

        // Only allow ADMIN role if no admins exist yet (first signup)
        String safeRole = "STUDENT";
        if ("ADMIN".equalsIgnoreCase(role) && !anyAdmin()) safeRole = "ADMIN";

        User u = new User(username.trim(), hash(password),
                fullName.isBlank() ? username : fullName.trim(),
                department.trim(), safeRole);
        String token = generateToken();
        u.setSessionToken(token);
        users[userCount++] = u;
        saveUsers();
        addHistory("SIGNUP", null, 0, username, username + " registered as " + safeRole);
        saveHistory();

        setSessionCookie(response, token);
        return ok(userMap(u));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(
            @RequestParam String username,
            @RequestParam String password,
            HttpServletResponse response) {

        User u = findUser(username);
        if (u == null || !u.getPasswordHash().equals(hash(password)))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid username or password."));

        String token = generateToken();
        u.setSessionToken(token);
        saveUsers();
        setSessionCookie(response, token);
        return ok(userMap(u));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String,Object>> logout(
            HttpServletRequest request, HttpServletResponse response) {

        User u = userFromRequest(request);
        if (u != null) { u.setSessionToken(null); saveUsers(); }
        clearSessionCookie(response);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out."));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String,Object>> me(HttpServletRequest request) {
        User u = userFromRequest(request);
        if (u == null)
            return ResponseEntity.ok(Map.of("authenticated", false));
        Map<String,Object> r = new LinkedHashMap<>();
        r.put("authenticated", true);
        r.put("user", userMap(u));
        return ResponseEntity.ok(r);
    }

    // ════════════════════════════════════════════════════════════
    // RESOURCES (public read, auth required for write)
    // ════════════════════════════════════════════════════════════

    @GetMapping("/resources")
    public ResponseEntity<List<Map<String,Object>>> getAllResources() {
        List<Map<String,Object>> list = new ArrayList<>();
        for (int i = 0; i < resCount; i++) list.add(resourceToMap(resources[i]));
        return ResponseEntity.ok(list);
    }

    @PostMapping("/allocate")
    public ResponseEntity<String> allocateResource(
            @RequestParam String resId,
            @RequestParam String deptId,
            @RequestParam String date,
            @RequestParam(defaultValue = "1") int qty,
            HttpServletRequest request) {

        if (userFromRequest(request) == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Please log in first.");

        Resource target = findResource(resId);
        if (target == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Resource '" + resId + "' not found.");
        if (target.getAvailableQty() < qty)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Only " + target.getAvailableQty() + " unit(s) available.");

        target.allocate(qty);
        String allocId = "A" + (allocCount + 1);
        allocations[allocCount++] = new Allocation(allocId, resId, deptId, date, qty);
        addHistory("ALLOCATE", target, qty, deptId,
                "Allocated " + qty + " unit(s) to " + deptId + " on " + date);
        saveAllocations(); saveHistory();

        return ResponseEntity.ok("Success: " + qty + " unit(s) of '" + target.getResourceName()
                + "' allocated to " + deptId + ".");
    }

    @PostMapping("/release")
    public ResponseEntity<String> releaseResource(
            @RequestParam String resId,
            @RequestParam(defaultValue = "1") int qty,
            HttpServletRequest request) {

        if (userFromRequest(request) == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Please log in first.");

        Resource target = findResource(resId);
        if (target == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Resource '" + resId + "' not found.");
        if (target.getAllocatedQty() < qty)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Only " + target.getAllocatedQty() + " unit(s) allocated.");

        target.release(qty);
        removeAllocations(resId, qty);
        addHistory("RELEASE", target, qty, "", "Released " + qty + " unit(s) of " + target.getResourceName());
        saveAllocations(); saveHistory();

        return ResponseEntity.ok("Success: " + qty + " unit(s) of '" + target.getResourceName() + "' released.");
    }

    @PostMapping("/resources/add")
    public ResponseEntity<String> addResource(
            @RequestParam String name,
            @RequestParam(defaultValue = "General") String type,
            @RequestParam(defaultValue = "Campus") String location,
            @RequestParam(defaultValue = "") String detail,
            @RequestParam(defaultValue = "1") int totalQty,
            HttpServletRequest request) {

        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body("Error: Please log in first.");
        if (!u.isAdmin()) return ResponseEntity.status(403).body("Error: Admin access required.");
        if (name.isBlank()) return ResponseEntity.badRequest().body("Error: Name is required.");
        if (resCount >= resources.length) return ResponseEntity.badRequest().body("Error: Resource limit reached.");

        String id = generateId(type);
        Resource r = new Resource(id, name.trim(), type, location, detail, totalQty);
        resources[resCount++] = r;
        addHistory("ADD", r, totalQty, u.getUsername(), "Resource added by " + u.getUsername());
        saveHistory();
        return ResponseEntity.ok("Success: Resource '" + name + "' added with ID " + id + ".");
    }

    @PostMapping("/resources/update")
    public ResponseEntity<String> updateResource(
            @RequestParam String resId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String detail,
            @RequestParam(required = false) Integer totalQty,
            HttpServletRequest request) {

        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body("Error: Please log in first.");
        if (!u.isAdmin()) return ResponseEntity.status(403).body("Error: Admin access required.");

        Resource target = findResource(resId);
        if (target == null)
            return ResponseEntity.status(404).body("Error: Resource '" + resId + "' not found.");

        if (name     != null && !name.isBlank())     target.setResourceName(name.trim());
        if (type     != null && !type.isBlank())     target.setType(type.trim());
        if (location != null && !location.isBlank()) target.setLocation(location.trim());
        if (detail   != null)                         target.setDetail(detail.trim());
        if (totalQty != null && totalQty > 0)         target.setTotalQty(totalQty);

        addHistory("UPDATE", target, 0, u.getUsername(), "Updated by " + u.getUsername());
        saveHistory();
        return ResponseEntity.ok("Success: Resource '" + resId + "' updated.");
    }

    @PostMapping("/resources/delete")
    public ResponseEntity<String> deleteResource(
            @RequestParam String resId,
            HttpServletRequest request) {

        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body("Error: Please log in first.");
        if (!u.isAdmin()) return ResponseEntity.status(403).body("Error: Admin access required.");

        int idx = findIndex(resId);
        if (idx < 0) return ResponseEntity.status(404).body("Error: Resource '" + resId + "' not found.");
        if (resources[idx].getAllocatedQty() > 0)
            return ResponseEntity.badRequest().body("Error: Cannot delete — resource has active allocations.");

        String name = resources[idx].getResourceName();
        for (int i = idx; i < resCount - 1; i++) resources[i] = resources[i + 1];
        resources[--resCount] = null;
        removeAllAllocations(resId);
        saveAllocations(); saveHistory();
        return ResponseEntity.ok("Success: Resource '" + name + "' deleted.");
    }

    // ════════════════════════════════════════════════════════════
    // BOOKINGS
    // ════════════════════════════════════════════════════════════

    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String,Object>>> getBookings(HttpServletRequest request) {
        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body(null);

        List<Map<String,Object>> list = new ArrayList<>();
        for (int i = bookCount - 1; i >= 0; i--) {
            Booking b = bookings[i];
            // Students see only their own bookings; admins see all
            if (!u.isAdmin() && !b.getUsername().equals(u.getUsername())) continue;
            list.add(bookingToMap(b));
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/bookings/create")
    public ResponseEntity<String> createBooking(
            @RequestParam String resourceId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "") String purpose,
            HttpServletRequest request) {

        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body("Error: Please log in first.");

        Resource res = findResource(resourceId);
        if (res == null)
            return ResponseEntity.status(404).body("Error: Resource '" + resourceId + "' not found.");
        if (startDate.isBlank() || endDate.isBlank())
            return ResponseEntity.badRequest().body("Error: Start and end dates are required.");
        if (bookCount >= bookings.length)
            return ResponseEntity.badRequest().body("Error: Booking limit reached.");

        String id = "B" + String.format("%03d", bookCount + 1);
        String now = LocalDateTime.now().format(TS);
        bookings[bookCount++] = new Booking(
                id, resourceId, res.getResourceName(),
                u.getUsername(), u.getDepartment(),
                startDate, endDate, purpose,
                "PENDING", now);
        saveBookings();
        addHistory("BOOKING", res, 1, u.getUsername(),
                u.getUsername() + " booked " + res.getResourceName()
                        + " from " + startDate + " to " + endDate);
        saveHistory();
        return ResponseEntity.ok("Success: Booking " + id + " created for '"
                + res.getResourceName() + "'. Status: PENDING.");
    }

    @PostMapping("/bookings/cancel")
    public ResponseEntity<String> cancelBooking(
            @RequestParam String bookingId,
            HttpServletRequest request) {

        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body("Error: Please log in first.");

        for (int i = 0; i < bookCount; i++) {
            Booking b = bookings[i];
            if (b.getBookingId().equals(bookingId)) {
                if (!u.isAdmin() && !b.getUsername().equals(u.getUsername()))
                    return ResponseEntity.status(403).body("Error: Not your booking.");
                if ("CANCELLED".equals(b.getStatus()))
                    return ResponseEntity.badRequest().body("Error: Already cancelled.");
                b.setStatus("CANCELLED");
                saveBookings();
                return ResponseEntity.ok("Success: Booking " + bookingId + " cancelled.");
            }
        }
        return ResponseEntity.status(404).body("Error: Booking '" + bookingId + "' not found.");
    }

    @PostMapping("/bookings/approve")
    public ResponseEntity<String> approveBooking(
            @RequestParam String bookingId,
            HttpServletRequest request) {

        User u = userFromRequest(request);
        if (u == null) return ResponseEntity.status(401).body("Error: Please log in first.");
        if (!u.isAdmin()) return ResponseEntity.status(403).body("Error: Admin access required.");

        for (int i = 0; i < bookCount; i++) {
            Booking b = bookings[i];
            if (b.getBookingId().equals(bookingId)) {
                b.setStatus("APPROVED");
                saveBookings();
                return ResponseEntity.ok("Success: Booking " + bookingId + " approved.");
            }
        }
        return ResponseEntity.status(404).body("Error: Booking '" + bookingId + "' not found.");
    }

    // ════════════════════════════════════════════════════════════
    // HISTORY / INSIGHTS / REPORT
    // ════════════════════════════════════════════════════════════

    @GetMapping("/history")
    public ResponseEntity<List<Map<String,Object>>> getHistory() {
        List<Map<String,Object>> list = new ArrayList<>();
        for (int i = histCount - 1; i >= 0; i--) {
            HistoryEntry e = history[i];
            Map<String,Object> m = new LinkedHashMap<>();
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

    @GetMapping("/insights")
    public ResponseEntity<Map<String,Object>> getInsights() {
        int totalUnits = 0, availableUnits = 0, allocatedUnits = 0, lowStock = 0;
        Map<String,Integer> typeCounts = new LinkedHashMap<>();

        for (int i = 0; i < resCount; i++) {
            Resource r = resources[i];
            totalUnits     += r.getTotalQty();
            availableUnits += r.getAvailableQty();
            allocatedUnits += r.getAllocatedQty();
            if ("Low Stock".equals(r.getStatus())) lowStock++;
            typeCounts.merge(r.getType(), 1, Integer::sum);
        }

        List<Map<String,Object>> categories = new ArrayList<>();
        typeCounts.forEach((type, count) -> {
            Map<String,Object> cat = new LinkedHashMap<>();
            cat.put("name", type); cat.put("count", count);
            categories.add(cat);
        });

        List<Map<String,Object>> utilization = new ArrayList<>();
        for (int i = 0; i < resCount; i++) {
            Resource r = resources[i];
            if (r.getTotalQty() == 0) continue;
            int pct = (int) Math.round((double) r.getAllocatedQty() / r.getTotalQty() * 100);
            Map<String,Object> u = new LinkedHashMap<>();
            u.put("name", r.getResourceName()); u.put("id", r.getResourceId());
            u.put("utilizationPct", pct); utilization.add(u);
        }
        utilization.sort((a, b) -> (int) b.get("utilizationPct") - (int) a.get("utilizationPct"));

        Map<String,Object> stats = new LinkedHashMap<>();
        stats.put("resourceCount",  resCount);
        stats.put("totalUnits",     totalUnits);
        stats.put("availableUnits", availableUnits);
        stats.put("allocatedUnits", allocatedUnits);
        stats.put("lowStock",       lowStock);
        stats.put("activeAllocs",   allocCount);
        stats.put("historyCount",   histCount);
        stats.put("userCount",      userCount);
        stats.put("bookingCount",   bookCount);

        Map<String,Object> result = new LinkedHashMap<>();
        result.put("stats", stats); result.put("categories", categories);
        result.put("utilization", utilization);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/report")
    public ResponseEntity<String> getReport() {
        StringBuilder sb = new StringBuilder();
        sb.append("═══════════════════════════════════════════\n");
        sb.append("  SMART CAMPUS RESOURCE MANAGEMENT REPORT\n");
        sb.append("  Generated: ").append(LocalDateTime.now().format(TS)).append("\n");
        sb.append("═══════════════════════════════════════════\n\n");
        sb.append("RESOURCES (").append(resCount).append(")\n");
        sb.append("─────────────────────────────────────────\n");
        for (int i = 0; i < resCount; i++) {
            Resource r = resources[i];
            sb.append(String.format("%-6s %-22s %-14s %-20s  %d/%d  [%s]\n",
                    r.getResourceId(), r.getResourceName(), r.getType(),
                    r.getLocation(), r.getAvailableQty(), r.getTotalQty(), r.getStatus()));
        }
        sb.append("\nACTIVE ALLOCATIONS (").append(allocCount).append(")\n");
        sb.append("─────────────────────────────────────────\n");
        for (int i = 0; i < allocCount; i++) {
            Allocation a = allocations[i];
            sb.append(String.format("%-6s → %-10s  Dept: %-10s  Date: %s  Qty: %d\n",
                    a.getAllocationId(), a.getResourceId(), a.getDepartmentId(),
                    a.getDate(), a.getQuantity()));
        }
        sb.append("\nBOOKINGS (").append(bookCount).append(")\n");
        sb.append("─────────────────────────────────────────\n");
        for (int i = 0; i < bookCount; i++) {
            Booking b = bookings[i];
            sb.append(String.format("%-6s %-10s %-8s %-12s %s → %s [%s]\n",
                    b.getBookingId(), b.getResourceId(), b.getUsername(),
                    b.getDepartment(), b.getStartDate(), b.getEndDate(), b.getStatus()));
        }
        sb.append("\nRECENT HISTORY (last 20)\n");
        sb.append("─────────────────────────────────────────\n");
        int start = Math.max(0, histCount - 20);
        for (int i = histCount - 1; i >= start; i--) {
            HistoryEntry h = history[i];
            sb.append(String.format("[%s] %-8s %-6s qty=%d  %s\n",
                    h.getTimestamp(), h.getAction(), h.getResourceId(),
                    h.getQuantity(), h.getNote()));
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=campus-report.txt")
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
    private User findUser(String username) {
        for (int i = 0; i < userCount; i++)
            if (users[i].getUsername().equalsIgnoreCase(username)) return users[i];
        return null;
    }
    private User userFromRequest(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (SESSION_COOKIE.equals(c.getName()) && c.getValue() != null) {
                for (int i = 0; i < userCount; i++)
                    if (c.getValue().equals(users[i].getSessionToken())) return users[i];
            }
        }
        return null;
    }
    private boolean anyAdmin() {
        for (int i = 0; i < userCount; i++) if (users[i].isAdmin()) return true;
        return false;
    }
    private String generateToken() { return UUID.randomUUID().toString().replace("-", ""); }
    private String generateId(String type) {
        String prefix = "R";
        if (type != null) {
            String t = type.toLowerCase();
            if (t.contains("projector")) prefix = "P";
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
    private String hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] b = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte x : b) sb.append(String.format("%02x", x));
            return sb.toString();
        } catch (Exception e) { return input; }
    }
    private void setSessionCookie(HttpServletResponse res, String token) {
        Cookie c = new Cookie(SESSION_COOKIE, token);
        c.setHttpOnly(true); c.setPath("/"); c.setMaxAge(7 * 24 * 3600);
        // SameSite=None required for cross-origin cookies (Vercel → Render)
        res.addHeader("Set-Cookie",
                SESSION_COOKIE + "=" + token
                        + "; Path=/; HttpOnly; Max-Age=" + (7 * 24 * 3600)
                        + "; SameSite=None; Secure");
    }
    private void clearSessionCookie(HttpServletResponse res) {
        res.addHeader("Set-Cookie",
                SESSION_COOKIE + "=; Path=/; HttpOnly; Max-Age=0; SameSite=None; Secure");
    }
    private void addHistory(String action, Resource r, int qty, String dept, String note) {
        if (histCount >= history.length) {
            System.arraycopy(history, 50, history, 0, history.length - 50);
            histCount -= 50;
        }
        history[histCount++] = new HistoryEntry(
                LocalDateTime.now().format(TS), action,
                r != null ? r.getResourceId()   : "—",
                r != null ? r.getResourceName() : "—",
                qty, dept, note);
    }
    private void removeAllocations(String resId, int qty) {
        int removed = 0;
        for (int i = allocCount - 1; i >= 0 && removed < qty; i--) {
            if (allocations[i].getResourceId().equals(resId)) {
                for (int k = i; k < allocCount - 1; k++) allocations[k] = allocations[k + 1];
                allocations[--allocCount] = null; removed++;
            }
        }
    }
    private void removeAllAllocations(String resId) {
        int i = 0;
        while (i < allocCount) {
            if (allocations[i].getResourceId().equals(resId)) {
                for (int k = i; k < allocCount - 1; k++) allocations[k] = allocations[k + 1];
                allocations[--allocCount] = null;
            } else i++;
        }
    }

    // ── Serialization helpers ──────────────────────────────────
    private Map<String,Object> resourceToMap(Resource r) {
        Map<String,Object> m = new LinkedHashMap<>();
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
    private Map<String,Object> userMap(User u) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("username",   u.getUsername());
        m.put("fullName",   u.getFullName());
        m.put("department", u.getDepartment());
        m.put("role",       u.getRole());
        m.put("isAdmin",    u.isAdmin());
        return m;
    }
    private Map<String,Object> bookingToMap(Booking b) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("bookingId",    b.getBookingId());
        m.put("resourceId",   b.getResourceId());
        m.put("resourceName", b.getResourceName());
        m.put("username",     b.getUsername());
        m.put("department",   b.getDepartment());
        m.put("startDate",    b.getStartDate());
        m.put("endDate",      b.getEndDate());
        m.put("purpose",      b.getPurpose());
        m.put("status",       b.getStatus());
        m.put("createdAt",    b.getCreatedAt());
        return m;
    }

    // ── File I/O ───────────────────────────────────────────────
    private void saveUsers() {
        try (PrintWriter w = new PrintWriter(new FileWriter(USERS_FILE))) {
            for (int i = 0; i < userCount; i++) {
                User u = users[i];
                w.println(u.getUsername() + "|" + u.getPasswordHash() + "|"
                        + u.getFullName() + "|" + u.getDepartment() + "|"
                        + u.getRole() + "|" + (u.getSessionToken() != null ? u.getSessionToken() : ""));
            }
        } catch (IOException ignored) {}
    }
    private void loadUsers() {
        File f = new File(USERS_FILE);
        if (!f.exists()) return;
        try (BufferedReader r = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = r.readLine()) != null && userCount < users.length) {
                String[] p = line.split("\\|", 6);
                if (p.length < 5) continue;
                User u = new User(p[0], p[1], p[2], p[3], p[4]);
                if (p.length == 6 && !p[5].isBlank()) u.setSessionToken(p[5]);
                users[userCount++] = u;
            }
        } catch (IOException ignored) {}
    }
    private void saveAllocations() {
        try (PrintWriter w = new PrintWriter(new FileWriter(ALLOC_FILE))) {
            for (int i = 0; i < allocCount; i++) {
                Allocation a = allocations[i];
                w.println(a.getAllocationId() + "," + a.getResourceId() + ","
                        + a.getDepartmentId() + "," + a.getDate() + "," + a.getQuantity());
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
                        p[0], p[1], p[2], p[3], parseIntSafe(p[4]), p[5], p[6]);
            }
        } catch (IOException ignored) {}
    }
    private void saveBookings() {
        try (PrintWriter w = new PrintWriter(new FileWriter(BOOKINGS_FILE))) {
            for (int i = 0; i < bookCount; i++) {
                Booking b = bookings[i];
                w.println(b.getBookingId() + "|" + b.getResourceId() + "|"
                        + b.getResourceName() + "|" + b.getUsername() + "|"
                        + b.getDepartment() + "|" + b.getStartDate() + "|"
                        + b.getEndDate() + "|" + b.getPurpose() + "|"
                        + b.getStatus() + "|" + b.getCreatedAt());
            }
        } catch (IOException ignored) {}
    }
    private void loadBookings() {
        File f = new File(BOOKINGS_FILE);
        if (!f.exists()) return;
        try (BufferedReader r = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = r.readLine()) != null && bookCount < bookings.length) {
                String[] p = line.split("\\|", 10);
                if (p.length < 10) continue;
                bookings[bookCount++] = new Booking(
                        p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9]);
            }
        } catch (IOException ignored) {}
    }
    private int parseIntSafe(String s) {
        try { return Integer.parseInt(s.trim()); } catch (Exception e) { return 1; }
    }
    private ResponseEntity<Map<String,Object>> fail(String msg) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", msg));
    }
    private ResponseEntity<Map<String,Object>> ok(Map<String,Object> userInfo) {
        Map<String,Object> r = new LinkedHashMap<>();
        r.put("success", true);
        r.put("message", "OK");
        r.put("user", userInfo);
        return ResponseEntity.ok(r);
    }
}