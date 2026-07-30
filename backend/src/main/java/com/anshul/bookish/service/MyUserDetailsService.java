package com.anshul.bookish.service;

import com.anshul.bookish.entity.Users;
import com.anshul.bookish.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Spring Security calls this with whatever string was passed to
     * UsernamePasswordAuthenticationToken (username field).
     *
     * We support both email-based login (from the frontend login form)
     * and username-based lookup (used by the JWT filter which stores userName in the token).
     */
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Try by email first (login form sends email)
        return userRepository.findByEmail(identifier)
                .map(u -> (UserDetails) u)
                // Fall back to userName (used by JWT filter)
                .orElseGet(() -> {
                    Users byUsername = userRepository.findByUserName(identifier);
                    if (byUsername == null)
                        throw new UsernameNotFoundException("User not found: " + identifier);
                    return byUsername;
                });
    }
}
