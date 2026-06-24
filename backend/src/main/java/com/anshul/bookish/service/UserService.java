package com.anshul.bookish.service;

import com.anshul.bookish.entity.Users;
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

    public Users addUser(Users user){
        return userRepository.save(user);
    }

    public Optional<Users> getUserById(UUID userId){ //add exeption handling
        Optional<Users> user = userRepository.findById(userId);
        return user;
    }
    public List< Users> getAllUsers(){
        return userRepository.findAll();
    }
    @Transactional
    public Users updateUser(Users user) {
        try{
            Users inMemoryUser = getUserById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Users is not present: " + user.getId()));
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
        Optional<Users> user = getUserById(userId);
        if(user.isPresent()){
            userRepository.deleteById(userId);
        }
    }
}
