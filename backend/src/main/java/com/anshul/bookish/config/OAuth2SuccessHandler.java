package com.anshul.bookish.config;

import com.anshul.bookish.entity.Users;
import com.anshul.bookish.repository.UserRepository;
import com.anshul.bookish.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * After a successful Google OAuth2 login:
 * 1. Looks up (or creates) the local Users record by email.
 * 2. Issues a JWT for that user.
 * 3. Redirects the browser to the frontend callback URL with the token as a query param.
 *
 * Frontend should read: /oauth2/callback?token=<jwt>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // Change this to wherever your frontend lives
    private static final String FRONTEND_REDIRECT = "http://localhost:5173/oauth2/callback";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        // Find or register the user
        Users user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("OAuth2 first-time login — registering user: {}", email);
                    Users newUser = Users.builder()
                            .email(email)
                            .name(name)
                            .userName(email)          // use email as default username
                            .password(UUID.randomUUID().toString()) // random unusable password
                            .build();
                    return userRepository.save(newUser);
                });

        String jwt = jwtService.generateToken(user);
        String redirectUrl = FRONTEND_REDIRECT + "?token=" + jwt;

        log.info("OAuth2 login successful for {}; redirecting with JWT", email);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
