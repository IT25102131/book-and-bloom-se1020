package lk.bookbloom.model;

import java.util.*;
import java.math.BigDecimal;

public class Author {
    private String id;
    private String name;
    private String bio;
    private String nationality = "";
    private String primaryGenre = "";
    private String accolades = "";
    private String bornYear = "";
    private String photoUrl = "";

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getNationality() { return nationality != null ? nationality : ""; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPrimaryGenre() { return primaryGenre != null ? primaryGenre : ""; }
    public void setPrimaryGenre(String primaryGenre) { this.primaryGenre = primaryGenre; }

    public String getAccolades() { return accolades != null ? accolades : ""; }
    public void setAccolades(String accolades) { this.accolades = accolades; }

    public String getBornYear() { return bornYear != null ? bornYear : ""; }
    public void setBornYear(String bornYear) { this.bornYear = bornYear; }

    public String getPhotoUrl() { return photoUrl != null ? photoUrl : ""; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
