package com.smartcampus.hub.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/email/{email}")
    public User getByEmail(@PathVariable String email) {
        return userRepository.findByEmail(URLDecoder.decode(email, StandardCharsets.UTF_8)).orElse(null);
    }

    @GetMapping("/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(URLDecoder.decode(email, StandardCharsets.UTF_8)).orElse(null);
    }
}
