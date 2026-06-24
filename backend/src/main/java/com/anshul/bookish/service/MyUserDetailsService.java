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
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user =  userRepository.findByUserName(username);
        if(user!=null){
            return user;
        }
        else{
            throw new RuntimeException("Cant find user");
        }
    }
}
