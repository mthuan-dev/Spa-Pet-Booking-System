package com.petspa.petbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class PetSpaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetSpaApplication.class, args);
    }
}
