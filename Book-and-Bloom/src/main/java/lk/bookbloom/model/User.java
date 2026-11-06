package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.*;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "kind")
@JsonSubTypes({@JsonSubTypes.Type(value=AdminUser.class,name="ADMIN"),@JsonSubTypes.Type(value=Customer.class,name="CUSTOMER")})
public abstract class User {
    private String id;
    private String name;
    private String email;
    private String passwordHash;
    private String address = "";
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public abstract boolean canManageCatalog();
    public abstract String role();
    public Map<String,Object> publicProfile() {
        return Map.of("id",id,"name",name,"email",email,"address",address,"role",role(),"createdAt",createdAt);
    }
}
