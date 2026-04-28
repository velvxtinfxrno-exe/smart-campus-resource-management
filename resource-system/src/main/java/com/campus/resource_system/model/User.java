package com.campus.resource_system.model;

public class User {
    private String username;
    private String passwordHash;
    private String fullName;
    private String department;
    private String role;          // "ADMIN" or "STUDENT"
    private String sessionToken;  // null when logged out

    public User(String username, String passwordHash,
                String fullName, String department, String role) {
        this.username     = username;
        this.passwordHash = passwordHash;
        this.fullName     = fullName;
        this.department   = department;
        this.role         = role == null ? "STUDENT" : role.toUpperCase();
        this.sessionToken = null;
    }

    public String getUsername()     { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName()     { return fullName; }
    public String getDepartment()   { return department; }
    public String getRole()         { return role; }
    public String getSessionToken() { return sessionToken; }

    public void setFullName(String v)     { this.fullName   = v; }
    public void setDepartment(String v)   { this.department = v; }
    public void setSessionToken(String v) { this.sessionToken = v; }

    public boolean isAdmin()    { return "ADMIN".equals(role); }
    public boolean isLoggedIn() { return sessionToken != null; }
}
