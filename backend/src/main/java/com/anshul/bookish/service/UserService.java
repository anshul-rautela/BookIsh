package com.anshul.bookish.service;

import com.anshul.bookish.entity.User;
import com.anshul.bookish.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User addUser(User user){
        return userRepository.save(user);
    }

    public Optional<User> getUserById(UUID userId){ //add exeption handling
        Optional<User> user = userRepository.findById(userId);
        return user;
    }
    public List< User> getAllUsers(){
        return userRepository.findAll();
    }
    @Transactional
    public User updateUser(User user) {
        try{
            User inMemoryUser = getUserById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User is not present: " + user.getId()));
                if (user.getUserName() != null && !user.getUserName().trim().equals("")) inMemoryUser.setUserName(user.getUserName());
                if (user.getName() != null && !user.getName().trim().equals("")) inMemoryUser.setName(user.getName());
                if (user.getEmail() != null && !user.getEmail().trim().equals("")) inMemoryUser.setEmail(user.getEmail());
                if (user.getPassword() != null && !user.getPassword().trim().equals("")) inMemoryUser.setPassword(user.getPassword());
                return userRepository.save(inMemoryUser);
        }catch (Exception e){
            log.error("Error: can't update user ",e);
            return null;
        }
    }

    public void deleteUserById(UUID userId) {
        Optional<User> user = getUserById(userId);
        if(user.isPresent()){
            userRepository.deleteById(userId);
        }
    }
}
